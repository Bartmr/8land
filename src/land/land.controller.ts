import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { InjectConnection } from '@nestjs/typeorm';
import {
  CreateLandRequestDTO,
  CreateLandResponseDTO,
} from 'libs/shared/src/land/create/create-land.dto';
import { UploadLandAssetsParameters } from 'libs/shared/src/land/upload-assets/upload-land-assets.dto';
import { Role } from 'src/auth/roles/roles';
import { RolesUpAndIncluding } from 'src/auth/roles/roles.decorator';
import { AuditContext } from 'src/internals/auditing/audit-context';
import { WithAuditContext } from 'src/internals/auditing/audit.decorator';
import { ResourceNotFoundException } from 'src/internals/server/resource-not-found.exception';
import { getSearchableName } from 'src/internals/utils/get-searchable-name';
import { Connection } from 'typeorm';
import { BlockEntryRepository } from '../blocks/typeorm/block-entry.repository';
import { LandRepository } from './typeorm/land.repository';
import fileType from 'file-type';
import { createTiledJSONSchema } from 'libs/shared/src/land/upload-assets/upload-land-assets.schemas';
import { StorageService } from 'src/internals/storage/storage.service';
import { InferType } from 'not-me/lib/schemas/schema';
import { throwError } from 'src/internals/utils/throw-error';
import { ApiBody, ApiConsumes, ApiProperty } from '@nestjs/swagger';
import {
  EditLandBodyDTO,
  EditLandDTO,
  EditLandParametersDTO,
} from 'libs/shared/src/land/edit/edit-land.dto';
import {
  IndexLandsDTO,
  IndexLandsQueryDTO,
} from 'libs/shared/src/land/index/index-lands.dto';
import {
  GetLandDTO,
  GetLandParametersDTO,
} from 'libs/shared/src/land/get/get-land.dto';
import { BlockEntry } from '../blocks/typeorm/block-entry.entity';
import { NonNullableFields } from 'libs/shared/src/internals/utils/types/nullable-types';
import { PublicRoute } from 'src/auth/public-route.decorator';

const TiledJSONSchema = createTiledJSONSchema();

class LandAssetsRequestDTO {
  @ApiProperty({ type: 'string', format: 'binary' })
  map!: unknown;
  @ApiProperty({ type: 'string', format: 'binary' })
  tileset!: unknown;
}

@Controller('lands')
export class LandController {
  constructor(
    @InjectConnection() private connection: Connection,
    private storageService: StorageService,
  ) {}

  @Post()
  @RolesUpAndIncluding(Role.Admin)
  createLand(
    @Body() body: CreateLandRequestDTO,
    @WithAuditContext() auditContext: AuditContext,
  ): Promise<CreateLandResponseDTO> {
    return this.connection.transaction(async (e) => {
      const landRepo = e.getCustomRepository(LandRepository);

      const landWithSameName = await landRepo.findOne({
        where: {
          searchableName: getSearchableName(body.name),
        },
      });

      if (landWithSameName) {
        throw new ConflictException({ error: 'name-already-taken' });
      }

      const land = await landRepo.create(
        {
          name: body.name,
          searchableName: getSearchableName(body.name),
          blocks: Promise.resolve([]),
          backgroundMusicUrl: null,
          hasAssets: null,
        },
        auditContext,
      );

      return {
        id: land.id,
        name: land.name,
      };
    });
  }

  @RolesUpAndIncluding(Role.Admin)
  @HttpCode(204)
  @Put(':landId/assets')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'map', maxCount: 1 },
      { name: 'tileset', maxCount: 1 },
    ]),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: LandAssetsRequestDTO,
  })
  async uploadLandAssets(
    @Param() params: UploadLandAssetsParameters,
    @UploadedFiles()
    files: { map?: Express.Multer.File[]; tileset?: Express.Multer.File[] },
    @WithAuditContext() auditContext: AuditContext,
  ): Promise<void> {
    const map =
      files.map?.[0] ||
      (() => {
        throw new BadRequestException({ error: 'no-map-file' });
      })();
    const tileset =
      files.tileset?.[0] ||
      (() => {
        throw new BadRequestException({ error: 'no-tileset-file' });
      })();

    if (map.size > 128000) {
      throw new BadRequestException({ error: 'map-exceeds-file-size-limit' });
    }

    if (tileset.size > 64000) {
      throw new BadRequestException({
        error: 'tileset-exceeds-file-size-limit',
      });
    }

    const tilesetFormat =
      (await fileType.fromBuffer(tileset.buffer)) ||
      (() => {
        throw new BadRequestException({ error: 'unrecognized-tileset-format' });
      })();

    if (tilesetFormat.ext !== 'png' || tilesetFormat.mime !== 'image/png') {
      throw new BadRequestException('tileset-not-a-png-file');
    }

    let mapJSON;

    try {
      const string = map.buffer.toString();

      mapJSON = JSON.parse(string) as unknown;
    } catch (err) {
      throw new BadRequestException({ error: 'unparsable-map-json' });
    }

    const tiledJSONValidationResult = TiledJSONSchema.validate(mapJSON);

    if (tiledJSONValidationResult.errors) {
      throw new BadRequestException({
        error: 'tiled-json-validation-error',
        messageTree: tiledJSONValidationResult.messagesTree,
      });
    } else {
      const tilesetStorageKey = `${params.landId}/tileset.png`;
      const mapStorageKey = `${params.landId}/map.json`;

      await this.connection.transaction(async (e) => {
        const landRepo = e.getCustomRepository(LandRepository);

        const land = await landRepo.findOne({
          where: {
            id: params.landId,
          },
        });

        if (!land) {
          throw new ResourceNotFoundException();
        }

        await this.storageService.saveBuffer(tilesetStorageKey, tileset.buffer);

        try {
          const toSave: InferType<typeof TiledJSONSchema> = {
            ...tiledJSONValidationResult.value,
            tilesets: [
              {
                ...(tiledJSONValidationResult.value.tilesets[0] ||
                  throwError()),
                image: 'tileset.png',
              },
            ],
          };

          await this.storageService.saveText(
            mapStorageKey,
            JSON.stringify(toSave),
          );
        } catch (err) {
          await this.storageService.removeFile(tilesetStorageKey);
          throw err;
        }

        if (!land.hasAssets) {
          land.hasAssets = true;

          await landRepo.save(land, auditContext);
        } else {
          land.updatedAt = new Date();

          await landRepo.save(land, auditContext);
        }
      });
    }
  }

  @Put(':landId')
  @RolesUpAndIncluding(Role.Admin)
  editLand(
    @Param() param: EditLandParametersDTO,
    @Body() body: EditLandBodyDTO,
    @WithAuditContext() auditContext: AuditContext,
  ): Promise<EditLandDTO> {
    return this.connection.transaction(async (e) => {
      const landRepository = e.getCustomRepository(LandRepository);

      const land = await landRepository.findOne({
        where: {
          id: param.landId,
        },
      });

      if (!land) {
        throw new ResourceNotFoundException();
      }

      if (body.name && body.name !== land.name) {
        const searchableName = getSearchableName(body.name);

        const landWithSameName = await landRepository.findOne({
          where: {
            searchableName,
          },
        });

        if (landWithSameName) {
          throw new ConflictException({ error: 'name-already-taken' });
        }

        land.name = body.name;
        land.searchableName = searchableName;
      }

      if (
        typeof body.backgroundMusicUrl !== 'undefined' &&
        body.backgroundMusicUrl != land.backgroundMusicUrl
      ) {
        land.backgroundMusicUrl = body.backgroundMusicUrl;
      }

      await landRepository.save(land, auditContext);

      return {
        id: land.id,
        name: land.name,
      };
    });
  }

  @Get()
  @RolesUpAndIncluding(Role.Admin)
  async indexLands(@Query() query: IndexLandsQueryDTO): Promise<IndexLandsDTO> {
    const landsRepository = this.connection.getCustomRepository(LandRepository);

    const results = await landsRepository.find({
      order: {
        createdAt: 'DESC',
      },
      skip: query.skip,
    });

    return {
      total: results.total,
      limit: results.limit,
      lands: results.rows.map((c) => ({
        id: c.id,
        name: c.name,
        published: !!c.hasAssets,
      })),
    };
  }

  @Get('/resume')
  @PublicRoute()
  async resume(): Promise<GetLandDTO> {
    const landsRepository = this.connection.getCustomRepository(LandRepository);

    const results = await landsRepository.find({
      order: {
        createdAt: 'ASC',
      },
      where: {
        hasAssets: true,
        // TODO territoryId: IsNull()
      },
      skip: 0,
    });

    const firstLand = results.rows[0];

    if (!firstLand) {
      throw new Error();
    }

    return this.getLand({ id: firstLand.id });
  }

  @Get('/:id')
  @PublicRoute()
  async getLand(
    @Param() parameters: GetLandParametersDTO,
  ): Promise<GetLandDTO> {
    const landsRepository = this.connection.getCustomRepository(LandRepository);
    const blockEntriesRepository =
      this.connection.getCustomRepository(BlockEntryRepository);

    const land = await landsRepository.findOne({
      where: {
        id: parameters.id,
      },
    });

    if (!land) {
      throw new ResourceNotFoundException();
    }

    const blockEntries = await blockEntriesRepository.find({
      skip: 0,
      where: {
        land: land.id,
      },
    });

    if (blockEntries.total > blockEntries.limit) {
      throw new Error();
    }

    const doorBlocksReferencing = await blockEntriesRepository.getManyAndCount(
      {
        alias: 'block',
        skip: 0,
      },
      (qb) => {
        return qb
          .leftJoinAndSelect('block.door', 'door')
          .leftJoinAndSelect('block.land', 'land')
          .where('door.toLand = :toLandId', { toLandId: land.id });
      },
    );

    if (doorBlocksReferencing.total > doorBlocksReferencing.limit) {
      throw new Error();
    }

    return {
      id: land.id,
      name: land.name,
      backgroundMusicUrl: land.backgroundMusicUrl,
      assets: land.hasAssets
        ? {
            baseUrl: this.storageService.getHostUrl(),
            mapKey: `${land.id}/map.json`,
            tilesetKey: `${land.id}/tileset.png`,
          }
        : undefined,
      doorBlocksReferencing: doorBlocksReferencing.rows
        .filter((b): b is NonNullableFields<BlockEntry, 'door'> => !!b.door)
        .map((b) => {
          return {
            id: b.id,
            fromLandId: b.land.id,
            fromLandName: b.land.name,
          };
        }),
      doorBlocks: blockEntries.rows
        .filter((b): b is NonNullableFields<BlockEntry, 'door'> => !!b.door)
        .map((b) => {
          return {
            id: b.id,
            toLand: {
              id: b.door.toLand.id,
              name: b.door.toLand.name,
            },
          };
        }),
      territories: [],
    };
  }
}
