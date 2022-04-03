import {
  BadRequestException,
  ConflictException,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  Param,
  Put,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { InjectConnection } from '@nestjs/typeorm';
import {
  TERRITORY_MAP_SIZE_LIMIT,
  TERRITORY_TILESET_SIZE_LIMIT,
} from 'libs/shared/src/territories/edit/edit-territory.constants';
import {
  GetTerritoryIdByRaribleItemIdDTO,
  GetTerritoryIdByRaribleItemIdParamsDTO,
} from 'libs/shared/src/territories/get-id-by-rarible-item-id/get-territory-id-by-rarible-item-id.dto';
import {
  GetTerritoryDTO,
  GetTerritoryParametersDTO,
} from 'libs/shared/src/territories/get/get-territory.dto';
import {
  UploadTerritoryAssetsParametersDTO,
  UploadTerritoryAssetsRequestDTO,
} from 'libs/shared/src/territories/upload-assets/upload-assets.dto';
import { equals } from 'not-me/lib/schemas/equals/equals-schema';
import { object } from 'not-me/lib/schemas/object/object-schema';
import { string } from 'not-me/lib/schemas/string/string-schema';
import { AuthContext } from 'src/auth/auth-context';
import { WithAuthContext } from 'src/auth/auth-context.decorator';
import { RaribleApi } from 'src/internals/apis/rarible/rarible.api';
import { AuditContext } from 'src/internals/auditing/audit-context';
import { WithAuditContext } from 'src/internals/auditing/audit.decorator';
import { ResourceNotFoundException } from 'src/internals/server/resource-not-found.exception';
import {
  ContentType,
  StorageService,
} from 'src/internals/storage/storage.service';
import { Connection } from 'typeorm';
import { TerritoriesRepository } from './typeorm/territories.repository';
import { createTiledJSONSchema } from 'libs/shared/src/land/upload-assets/upload-land-assets.schemas';
import { InferType } from 'not-me/lib/schemas/schema';
import { throwError } from 'src/internals/utils/throw-error';
import { or } from 'not-me/lib/schemas/or/or-schema';
import sharp from 'sharp';

@Controller('territories')
export class TerritoriesEndUserController {
  constructor(
    @InjectConnection() private connection: Connection,
    private storageService: StorageService,
    private raribleApi: RaribleApi,
  ) {}

  async isAllowedToEditProject(itemId: string, walletAddress: string) {
    const res = await this.raribleApi.get(
      or([
        object({
          status: equals([200] as const).required(),
          body: object({
            owner: string().required(),
            tokenId: string().required(),
          }).required(),
        }),
        object({
          status: equals([404] as const).required(),
          body: object({}).required(),
        }),
      ]).required(),
      {
        path: `/ownerships/ETHEREUM:${itemId}:${walletAddress}`,
      },
    );

    if (res.status === 404) {
      return false;
    }

    return res.body.owner.replace('ETHEREUM:', '') === walletAddress;
  }

  @Get('/rarible/:itemId')
  async getTerritoryIdByRaribleItemId(
    @Param() param: GetTerritoryIdByRaribleItemIdParamsDTO,
    @WithAuthContext() authContext: AuthContext,
  ): Promise<GetTerritoryIdByRaribleItemIdDTO> {
    const walletAddress = authContext.user.walletAddress;
    if (!walletAddress) {
      throw new ConflictException();
    }

    const splitItemId = param.itemId.split(':');

    const contractAddress = splitItemId[0];
    const tokenId = splitItemId[1];

    if (!contractAddress) {
      throw new BadRequestException();
    }

    if (!tokenId) {
      throw new BadRequestException();
    }

    const territoriesRepository = this.connection.getCustomRepository(
      TerritoriesRepository,
    );

    const territory = await territoriesRepository.findOne({
      where: {
        tokenAddress: contractAddress,
        tokenId: tokenId,
      },
    });

    if (!territory) {
      throw new ResourceNotFoundException();
    }

    const allowedToEditProject = await this.isAllowedToEditProject(
      param.itemId,
      walletAddress,
    );

    return {
      id: territory.id,
      owned: allowedToEditProject,
    };
  }

  @Get(':id')
  async getTerritory(
    @Param() params: GetTerritoryParametersDTO,
    @WithAuthContext() authContext: AuthContext,
  ): Promise<GetTerritoryDTO> {
    const walletAddress = authContext.user.walletAddress;
    if (!walletAddress) {
      throw new ConflictException();
    }

    const territoriesRepository = this.connection.getCustomRepository(
      TerritoriesRepository,
    );
    const territory = await territoriesRepository.findOne({
      where: {
        id: params.id,
      },
    });
    if (!territory || !territory.tokenAddress || !territory.tokenId) {
      throw new ResourceNotFoundException();
    }

    const authorized = await this.isAllowedToEditProject(
      `${territory.tokenAddress}:${territory.tokenId}`,
      walletAddress,
    );

    if (!authorized) {
      throw new ForbiddenException();
    }

    const land = await territory.inLand;
    return {
      id: territory.id,
      startX: territory.startX,
      startY: territory.startY,
      endX: territory.endX,
      endY: territory.endY,
      doorBlocks: [],
      assets: territory.hasAssets
        ? {
            baseUrl: this.storageService.getHostUrl(),
            mapKey: `territories/${territory.id}/map.json`,
            tilesetKey: `territories/${territory.id}/tileset.png`,
          }
        : undefined,
      inLand: {
        name: land.name,
      },
      thumbnailUrl: `${this.storageService.getHostUrl()}/territories/${
        territory.id
      }/thumbnail.jpg`,
    };
  }

  @HttpCode(204)
  @Put(':id/assets')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'map', maxCount: 1 },
      { name: 'tileset', maxCount: 1 },
    ]),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: UploadTerritoryAssetsRequestDTO,
  })
  async uploadTerritoryAssets(
    @Param() params: UploadTerritoryAssetsParametersDTO,
    @UploadedFiles()
    files: { map?: Express.Multer.File[]; tileset?: Express.Multer.File[] },
    @WithAuditContext() auditContext: AuditContext,
    @WithAuthContext() authContext: AuthContext,
  ): Promise<void> {
    const territoriesRepository_NO_TRANSACTION =
      this.connection.getCustomRepository(TerritoriesRepository);
    const walletAddress = authContext.user.walletAddress;
    if (!walletAddress) {
      throw new ForbiddenException();
    }
    const territory_UNSAFE = await territoriesRepository_NO_TRANSACTION.findOne(
      {
        where: {
          id: params.id,
        },
      },
    );
    if (
      !territory_UNSAFE ||
      !territory_UNSAFE.tokenAddress ||
      !territory_UNSAFE.tokenId
    ) {
      throw new ResourceNotFoundException();
    }

    const authorized = await this.isAllowedToEditProject(
      `${territory_UNSAFE.tokenAddress}:${territory_UNSAFE.tokenId}`,
      walletAddress,
    );

    if (!authorized) {
      throw new ForbiddenException();
    }

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
    if (map.size > TERRITORY_MAP_SIZE_LIMIT) {
      throw new BadRequestException({ error: 'map-exceeds-file-size-limit' });
    }
    if (tileset.size > TERRITORY_TILESET_SIZE_LIMIT) {
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
      const jsonString = map.buffer.toString();
      mapJSON = JSON.parse(jsonString) as unknown;
    } catch (err) {
      throw new BadRequestException({ error: 'unparsable-map-json' });
    }
    const tiledJSONSchema = createTiledJSONSchema({
      maxWidth: territory_UNSAFE.endX - territory_UNSAFE.startX,
      maxHeight: territory_UNSAFE.endY - territory_UNSAFE.startY,
    });
    const tiledJSONValidationResult = tiledJSONSchema.validate(mapJSON);
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

    const tilesetStorageKey = `territories/${territory_UNSAFE.id}/tileset.png`;
    const mapStorageKey = `territories/${territory_UNSAFE.id}/map.json`;
    await this.connection.transaction(async (e) => {
      const territoriesRepo = e.getCustomRepository(TerritoriesRepository);
      const territory = await territoriesRepo.findOne({
        where: {
          id: params.id,
        },
      });
      if (!territory) {
        throw new ResourceNotFoundException();
      }
      await this.storageService.saveBuffer(tilesetStorageKey, tileset.buffer, {
        contentType: ContentType.PNG,
      });
      const toSave: InferType<typeof tiledJSONSchema> = {
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
      if (!territory.hasAssets) {
        territory.hasAssets = true;
      }
      territory.updatedAt = new Date();
      await territoriesRepo.save(territory, auditContext);
    });
  }
}
