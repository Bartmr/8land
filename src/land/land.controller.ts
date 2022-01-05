import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Delete,
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
import { CreateBlockRequestDTO } from 'libs/shared/src/land/blocks/create/create-block.dto';
import { BlockType } from 'libs/shared/src/land/blocks/create/create-block.enums';
import { DeleteBlockURLParameters } from 'libs/shared/src/land/blocks/delete/delete-block.dto';
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
import { BlockEntryRepository } from './typeorm/block-entry.repository';
import { DoorBlockRepository } from './typeorm/door-block.repository';
import { LandRepository } from './typeorm/land.repository';
import fileType from 'file-type';
import { createTiledJSONSchema } from 'libs/shared/src/land/upload-assets/upload-land-assets.schemas';
import { LandAssetsRepository } from './typeorm/land-assets.repository';
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
          assets: null,
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

    if (map.size > 512000) {
      throw new BadRequestException({ error: 'map-exceeds-file-size-limit' });
    }

    if (tileset.size > 512000) {
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
      const mapStorageKey = `${params.landId}/tiled.json`;

      const toSave: InferType<typeof TiledJSONSchema> = {
        ...tiledJSONValidationResult.value,
        tilesets: [
          {
            ...(tiledJSONValidationResult.value.tilesets[0] || throwError()),
            image: 'tiled.json',
          },
        ],
      };

      await this.connection.transaction(async (e) => {
        const landRepo = e.getCustomRepository(LandRepository);
        const landAssetsRepo = e.getCustomRepository(LandAssetsRepository);

        const land = await landRepo.findOne({
          where: {
            id: params.landId,
          },
        });

        if (!land) {
          throw new ResourceNotFoundException();
        }

        const tilesetUrl = await this.storageService.saveBuffer(
          tilesetStorageKey,
          tileset.buffer,
        );

        const mapUrl = await this.storageService.saveText(
          mapStorageKey,
          JSON.stringify(toSave, undefined, 2),
        );

        if (!land.assets) {
          const landAssets = await landAssetsRepo.create(
            {
              tiledJsonURL: mapUrl.url,
              tiledJsonStorageKey: mapStorageKey,
              tilesetImageURL: tilesetUrl.url,
              tilesetImageStorageKey: tilesetStorageKey,
            },
            auditContext,
          );

          land.assets = landAssets;

          await landRepo.save(land, auditContext);
        } else {
          land.updatedAt = new Date();

          await landRepo.save(land, auditContext);
        }
      });
    }
  }

  @Post('blocks')
  @RolesUpAndIncluding(Role.Admin)
  createBlock(
    @Body() body: CreateBlockRequestDTO,
    @WithAuditContext() auditContext: AuditContext,
  ) {
    return this.connection.transaction(async (e) => {
      const landRepository = e.getCustomRepository(LandRepository);
      const blockEntriesRepository =
        e.getCustomRepository(BlockEntryRepository);

      const land = await landRepository.findOne({
        where: { id: body.data.landId },
      });

      if (!land) {
        throw new ResourceNotFoundException({ error: 'land-not-found' });
      }

      const landBlocks = await land.blocks;

      if (landBlocks.length > 10) {
        throw new BadRequestException({ error: 'block-limit-exceeded' });
      }

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (body.data.type === BlockType.Door) {
        const doorBlockRepository = e.getCustomRepository(DoorBlockRepository);

        const toLand = await landRepository.findOne({
          where: {
            id: body.data.toLandId,
          },
        });

        if (!toLand) {
          throw new ResourceNotFoundException({
            error: 'destination land not found',
          });
        }

        const doorBlock = await doorBlockRepository.create(
          {
            toLand,
          },
          auditContext,
        );

        await blockEntriesRepository.create(
          {
            door: doorBlock,
            land,
          },
          auditContext,
        );

        return;
      } else {
        throw new BadRequestException();
      }
    });
  }

  @HttpCode(204)
  @Delete('blocks/:id')
  @RolesUpAndIncluding(Role.Admin)
  deleteBlock(
    @Param() param: DeleteBlockURLParameters,
    @WithAuditContext() auditContext: AuditContext,
  ) {
    return this.connection.transaction(async (e) => {
      const blockEntriesRepository =
        e.getCustomRepository(BlockEntryRepository);

      const block = await blockEntriesRepository.findOne({
        where: { id: param.id },
      });

      if (!block) {
        throw new ResourceNotFoundException();
      }

      if (block.door) {
        const doorBlockRepository = e.getCustomRepository(DoorBlockRepository);

        await doorBlockRepository.remove(block.door, auditContext);
      }

      await blockEntriesRepository.remove(block, auditContext);
    });
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
          throw new ConflictException('name-already-taken');
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
        published: !!c.assets,
      })),
    };
  }

  @Get('/:id')
  async getLand(
    @Param() parameters: GetLandParametersDTO,
  ): Promise<GetLandDTO> {
    const landsRepository = this.connection.getCustomRepository(LandRepository);

    const land = await landsRepository.findOne({
      where: {
        id: parameters.id,
      },
    });

    if (!land) {
      throw new ResourceNotFoundException();
    }

    return {
      id: land.id,
      name: land.name,
      backgroundMusicUrl: land.backgroundMusicUrl,
      mapUrl: land.assets?.tiledJsonURL,
      tilesetUrl: land.assets?.tilesetImageURL,
      doorBlocksReferencing: [], // TODO
      doorBlocks: [], // TODO
    };
  }
}
