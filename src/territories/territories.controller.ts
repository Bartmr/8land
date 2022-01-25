import {
  BadRequestException,
  ConflictException,
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { CreateTerritoryRequest } from 'libs/shared/src/territories/territories.dto';
import { CreateTerritoryRequestJSONSchema } from 'libs/shared/src/territories/territories.schemas';
import { Role } from 'src/auth/roles/roles';
import { RolesUpAndIncluding } from 'src/auth/roles/roles.decorator';
import fileType from 'file-type';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import { LandRepository } from 'src/land/typeorm/land.repository';
import sharp from 'sharp';
import { throwError } from 'src/internals/utils/throw-error';
import { StorageService } from 'src/internals/storage/storage.service';
import { TerritoriesRepository } from './typeorm/territories.repository';
import { WithAuditContext } from 'src/internals/auditing/audit.decorator';
import { AuditContext } from 'src/internals/auditing/audit-context';
import { EnvironmentVariablesService } from 'src/internals/environment/environment-variables.service';
import territoryNFTContractJSON from 'libs/smart-contracts/artifacts/contracts/TerritoryNFT.sol/TerritoryNFT.json';
import { ethers } from 'ethers';
import { TerritoryNFT } from 'libs/smart-contracts/typechain-types';
import { ItselfStorageApi } from 'src/internals/apis/itself/itself-storage.api';
import { object } from 'not-me/lib/schemas/object/object-schema';
import { equals } from 'not-me/lib/schemas/equals/equals-schema';
import { number } from 'not-me/lib/schemas/number/number-schema';

@Controller('territories')
export class TerritoriesController {
  constructor(
    @InjectConnection() private connection: Connection,
    private storageService: StorageService,
    private itselfStorageApi: ItselfStorageApi,
  ) {}

  @Post()
  @RolesUpAndIncluding(Role.Admin)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'data', maxCount: 1 },
      { name: 'thumbnail', maxCount: 1 },
    ]),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: CreateTerritoryRequest,
  })
  async createTerritory(
    @UploadedFiles()
    files: {
      data?: Express.Multer.File[];
      thumbnail?: Express.Multer.File[];
    },
    @WithAuditContext() auditContext: AuditContext,
  ) {
    const dataFile =
      files.data?.[0] ||
      (() => {
        throw new BadRequestException({ error: 'no-data-file' });
      })();
    const thumbnailFile =
      files.thumbnail?.[0] ||
      (() => {
        throw new BadRequestException({ error: 'no-thumbnail-file' });
      })();

    if (dataFile.size > 64000) {
      throw new BadRequestException({ error: 'data-exceeds-file-size-limit' });
    }

    if (thumbnailFile.size > 1024000) {
      throw new BadRequestException({
        error: 'thumbnail-exceeds-file-size-limit',
      });
    }

    /* --- */

    const thumbnailFormat =
      (await fileType.fromBuffer(thumbnailFile.buffer)) ||
      (() => {
        throw new BadRequestException({
          error: 'unrecognized-thumbnail-format',
        });
      })();

    if (thumbnailFormat.ext !== 'png' || thumbnailFormat.mime !== 'image/png') {
      throw new BadRequestException('thumbnail-not-a-png-file');
    }

    /* --- */

    let dataJSON: unknown;

    try {
      const string = dataFile.buffer.toString();

      dataJSON = JSON.parse(string) as unknown;
    } catch (err) {
      throw new BadRequestException({ error: 'unparsable-data-json' });
    }

    const dataValidationResult =
      CreateTerritoryRequestJSONSchema.validate(dataJSON);

    if (dataValidationResult.errors) {
      throw new BadRequestException({
        error: 'data-validation-error',
        messageTree: dataValidationResult.messagesTree,
      });
    }

    const data = dataValidationResult.value;

    /* --- */
    const img = sharp(thumbnailFile.buffer);
    const imgMetadata = await img.metadata();

    const imgResized = await img
      .resize({
        width: (imgMetadata.width || throwError()) * 2,
        height: (imgMetadata.height || throwError()) * 2,
      })
      .jpeg()
      .toBuffer();

    /* --- */

    return this.connection.transaction(async (entityManager) => {
      const landsRepository = entityManager.getCustomRepository(LandRepository);
      const territoriesRepository = entityManager.getCustomRepository(
        TerritoriesRepository,
      );

      const land = await landsRepository.findOne({
        where: { id: data.landId },
      });

      if (!land) {
        throw new Error();
      }

      const existingTerritories = await land.territories;

      for (const territory of existingTerritories) {
        if (
          (data.data.startX >= territory.startX &&
            data.data.startX < territory.endX) ||
          (data.data.endX > territory.startX &&
            data.data.endX <= territory.endX) ||
          (data.data.startY >= territory.startY &&
            data.data.startY < territory.endY) ||
          (data.data.endY > territory.startY &&
            data.data.endY <= territory.endY)
        ) {
          throw new ConflictException({
            error: 'intersects-existing-territory',
          });
        }
      }

      const landMap = await this.itselfStorageApi.get(
        object({
          status: equals([200]).required(),
          body: object({
            height: number().required(),
            width: number().required(),
          }).required(),
        }).required(),
        {
          path: `/lands/${land.id}/map.json`,
        },
      );

      if (
        data.data.startX > landMap.body.width ||
        data.data.startY > landMap.body.height ||
        data.data.endX > landMap.body.width ||
        data.data.endY > landMap.body.height
      ) {
        throw new ConflictException('coordinates-exceeds-bounds');
      }

      const territory = await territoriesRepository.create(
        {
          startX: data.data.startX,
          startY: data.data.startY,
          endX: data.data.endX,
          endY: data.data.endY,
          hasAssets: false,
          inLand: Promise.resolve(land),
          doorBlocks: [],
        },
        auditContext,
      );

      const thumbnailStorageKey = `territories/${territory.id}/thumbnail.jpg`;

      await this.storageService.saveBuffer(thumbnailStorageKey, imgResized);

      const nftMetadataStorageKey = `territories/${territory.id}/nft-metadata.json`;

      try {
        const territoryNumber = existingTerritories.length + 1;
        await this.storageService.saveText(
          nftMetadataStorageKey,
          JSON.stringify({
            attributes: [
              {
                trait_type: 'Territory ID',
                value: `${territory.id}`,
              },
              {
                trait_type: 'In Land',
                value: `${land.name}`,
              },
              {
                trait_type: 'Width',
                value: `${territory.endX - territory.startX}`,
              },
              {
                trait_type: 'Height',
                value: `${territory.endY - territory.startY}`,
              },
              {
                trait_type: 'Total Area',
                value: `${
                  (territory.endX - territory.startX) *
                  (territory.endY - territory.startY)
                }`,
              },
            ],
            description: `8Land territory at ${land.name}.`,
            image: `${this.storageService.getHostUrl()}/${thumbnailStorageKey}`,
            name: `${land.name} - territory ${territoryNumber}`,
          }),
        );
      } catch (err) {
        await this.storageService.removeFile(thumbnailStorageKey);
        throw err;
      }

      const provider = new ethers.providers.JsonRpcProvider(
        EnvironmentVariablesService.variables.MORALIS_SPEEDY_NODE,
      );

      const wallet = new ethers.Wallet(
        EnvironmentVariablesService.variables.WALLET_PRIVATE_KEY,
        provider,
      );

      const nftContract = new ethers.Contract(
        EnvironmentVariablesService.variables.TERRITORY_NFT_CONTRACT_ADDRESS,
        territoryNFTContractJSON.abi,
        wallet,
      ) as TerritoryNFT;

      await nftContract.mintNFT(
        wallet.address,
        `${this.storageService.getHostUrl()}/${nftMetadataStorageKey}`,
      );
    });
  }
}
