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
import { LandRepository } from '../typeorm/land.repository';
import { createTiledJSONSchema } from 'libs/shared/src/land/upload-assets/upload-land-assets.schemas';
import {
  ContentType,
  StorageService,
} from 'src/internals/storage/storage.service';
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
import { LandsService } from '../lands.service';
import sharp from 'sharp';

const TiledJSONSchema = createTiledJSONSchema({
  maxWidth: null,
  maxHeight: null,
});

class LandAssetsRequestDTO {
  @ApiProperty({ type: 'string', format: 'binary' })
  map!: unknown;
  @ApiProperty({ type: 'string', format: 'binary' })
  tileset!: unknown;
}

@Controller('lands')
export class LandsAdminController {
  constructor(
    @InjectConnection() private connection: Connection,
    private storageService: StorageService,
    private landService: LandsService,
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
          doorBlocks: Promise.resolve([]),
          doorBlocksReferencing: Promise.resolve([]),
          backgroundMusicUrl: null,
          hasAssets: null,
          territories: Promise.resolve([]),
          appBlocks: [],
          world: Promise.resolve(null),
          isStartingLand: null,
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

    let tilesetMedatada: sharp.Metadata;

    try {
      const sharpImg = sharp(tileset.buffer);

      tilesetMedatada = await sharpImg.metadata();

      await sharpImg.stats();
    } catch (err) {
      throw new BadRequestException({ error: 'unrecognized-tileset-format' });
    }

    if (tilesetMedatada.format !== 'png') {
      throw new BadRequestException({ error: 'unrecognized-tileset-format' });
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
    }

    const tilesetSpecifications =
      tiledJSONValidationResult.value.tilesets[0] || throwError();

    if (
      tilesetMedatada.width !== tilesetSpecifications.imagewidth ||
      tilesetMedatada.height !== tilesetSpecifications.imageheight
    ) {
      throw new BadRequestException({
        error: 'tileset-dimensions-dont-match',
      });
    }

    const tilesetStorageKey = `lands/${params.landId}/tileset.png`;
    const mapStorageKey = `lands/${params.landId}/map.json`;

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

      await this.storageService.saveBuffer(tilesetStorageKey, tileset.buffer, {
        contentType: ContentType.PNG,
      });

      const toSave: InferType<typeof TiledJSONSchema> = {
        ...tiledJSONValidationResult.value,
        tilesets: [
          {
            ...(tiledJSONValidationResult.value.tilesets[0] || throwError()),
            image: 'tileset.png',
          },
        ],
      };

      await this.storageService.saveText(
        mapStorageKey,
        JSON.stringify(toSave),
        { contentType: ContentType.JSON },
      );

      if (!land.hasAssets) {
        land.hasAssets = true;
      }
      land.updatedAt = new Date();

      await landRepo.save(land, auditContext);
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
}
