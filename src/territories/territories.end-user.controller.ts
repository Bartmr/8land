import {
  BadRequestException,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  Param,
  Put,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { AuthContext } from 'src/auth/auth-context';
import { WithAuthContext } from 'src/auth/auth-context.decorator';
import { MoralisService } from 'src/internals/smart-contracts/moralis/moralis.service';
import { Connection } from 'typeorm';
import { EnvironmentVariablesService } from 'src/internals/environment/environment-variables.service';
import { TerritoryFromIndex } from 'libs/shared/src/territories/index/index-territories.dto';
import { throwError } from 'src/internals/utils/throw-error';
import { ItselfStorageApi } from 'src/internals/apis/itself/itself-storage.api';
import superagent from 'superagent';
import { object } from 'not-me/lib/schemas/object/object-schema';
import { array } from 'not-me/lib/schemas/array/array-schema';
import { string } from 'not-me/lib/schemas/string/string-schema';
import {
  GetTerritoryDTO,
  GetTerritoryParametersDTO,
} from 'libs/shared/src/territories/get/get-territory.dto';
import { TerritoriesRepository } from './typeorm/territories.repository';
import { ResourceNotFoundException } from 'src/internals/server/resource-not-found.exception';
import { StorageService } from 'src/internals/storage/storage.service';
import {
  UploadTerritoryAssetsParametersDTO,
  UploadTerritoryAssetsRequestDTO,
} from 'libs/shared/src/territories/upload-assets/upload-assets.dto';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { WithAuditContext } from 'src/internals/auditing/audit.decorator';
import { AuditContext } from 'src/internals/auditing/audit-context';
import {
  TERRITORY_MAP_SIZE_LIMIT,
  TERRITORY_TILESET_SIZE_LIMIT,
} from 'libs/shared/src/territories/edit/edit-territory.constants';
import fileType from 'file-type';
import { createTiledJSONSchema } from 'libs/shared/src/land/upload-assets/upload-land-assets.schemas';
import { InferType } from 'not-me/lib/schemas/schema';

@Controller('territories')
export class TerritoriesEndUserController {
  constructor(
    @InjectConnection() private connection: Connection,
    private moralisService: MoralisService,
    private itselfStorageApi: ItselfStorageApi,
    private storageService: StorageService,
  ) {}

  @Get()
  async getTerritories(
    @WithAuthContext() authContext: AuthContext,
  ): Promise<TerritoryFromIndex[]> {
    const moralis = this.moralisService.getMoralis();
    const walletAddress = authContext.user.walletAddress;

    if (!walletAddress) {
      return [];
    }

    const nfts = await moralis.Web3API.account.getNFTsForContract({
      address: walletAddress,
      chain: EnvironmentVariablesService.variables.WEB3_CHAIN,
      token_address:
        EnvironmentVariablesService.variables.TERRITORY_NFT_CONTRACT_ADDRESS,
    });

    if ((nfts.total || throwError()) > (nfts.page_size || throwError())) {
      throw new Error();
    }

    const territoriesAndTheirData = await Promise.all(
      (nfts.result || throwError()).map(async (n) => {
        const res = await superagent
          .get(n.token_uri || throwError())
          .ok((r) => r.status < 500)
          .send();

        if (
          res.statusCode === 404 &&
          EnvironmentVariablesService.variables.WEB3_CHAIN === 'mumbai'
        ) {
          return undefined;
        }

        if (res.statusCode !== 200) {
          throw new Error(
            `Url: ${n.token_uri || ''}; Status: ${res.statusCode}`,
          );
        }

        const validation = object({
          body: object({
            image: string().required(),
            name: string().required(),
            attributes: array(
              object({
                trait_type: string().required(),
                value: string().required(),
              }).required(),
            )
              .required()
              .transform((s) =>
                s.filter((c) => c.trait_type === 'Territory ID'),
              )
              .transform((s) => {
                const territoryId = s.find(
                  (c) => c.trait_type === 'Territory ID',
                );

                return territoryId ? territoryId.value : 'error';
              })
              .test((s) => (s === 'error' ? s : null)),
          }).required(),
        })
          .required()
          .validate({
            body: res.body as unknown,
          });

        if (validation.errors) {
          throw new Error(JSON.stringify(validation.messagesTree));
        } else {
          return {
            name: validation.value.body.name,
            thumbnailUrl: validation.value.body.image,
            id: validation.value.body.attributes,
          };
        }
      }),
    );

    return territoriesAndTheirData.filter((n): n is TerritoryFromIndex => !!n);
  }

  @Get(':id')
  async getTerritory(
    @Param() params: GetTerritoryParametersDTO,
  ): Promise<GetTerritoryDTO> {
    const territoriesRepository = this.connection.getCustomRepository(
      TerritoriesRepository,
    );

    const territory = await territoriesRepository.findOne({
      where: {
        id: params.id,
      },
    });

    if (!territory) {
      throw new ResourceNotFoundException();
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
    const moralis = this.moralisService.getMoralis();
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

    if (!territory_UNSAFE) {
      throw new ResourceNotFoundException();
    }

    const nftsFromUser = await moralis.Web3API.account.getNFTsForContract({
      address: walletAddress,
      chain: EnvironmentVariablesService.variables.WEB3_CHAIN,
      token_address:
        EnvironmentVariablesService.variables.TERRITORY_NFT_CONTRACT_ADDRESS,
    });

    if (
      (nftsFromUser.total || throwError()) >
      (nftsFromUser.page_size || throwError())
    ) {
      throw new Error();
    }

    const nft = (nftsFromUser.result || throwError()).find((n) => {
      return (
        n.token_uri ===
        `${this.storageService.getHostUrl()}/territories/${
          territory_UNSAFE.id
        }/nft-metadata.json`
      );
    });

    if (!nft) {
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
      const jsonString = map.buffer.toString();

      mapJSON = JSON.parse(jsonString) as unknown;
    } catch (err) {
      throw new BadRequestException({ error: 'unparsable-map-json' });
    }
    const tiledJSONSchema = createTiledJSONSchema({
      maxWidth: territory_UNSAFE.endX - territory_UNSAFE.startX,
      maxHeight: territory_UNSAFE.endY - territory_UNSAFE.startY,
      allowBackgroundColor: false,
    });

    const tiledJSONValidationResult = tiledJSONSchema.validate(mapJSON);

    if (tiledJSONValidationResult.errors) {
      throw new BadRequestException({
        error: 'tiled-json-validation-error',
        messageTree: tiledJSONValidationResult.messagesTree,
      });
    } else {
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

        await this.storageService.saveBuffer(tilesetStorageKey, tileset.buffer);

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
        );

        if (!territory.hasAssets) {
          territory.hasAssets = true;
        }
        territory.updatedAt = new Date();

        await territoriesRepo.save(territory, auditContext);
      });
    }
  }
}
