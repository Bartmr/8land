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
import { MoralisService } from 'src/internals/smart-contracts/moralis/alchemy-web3.service';
import { EnvironmentVariablesService } from 'src/internals/environment/environment-variables.service';
import territoryNFTContractJSON from 'libs/smart-contracts/artifacts/contracts/TerritoryNFT.sol/TerritoryNFT.json';

@Controller('territories')
export class TerritoriesController {
  constructor(
    @InjectConnection() private connection: Connection,
    private storageService: StorageService,
    private alchemyWeb3Service: MoralisService,
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
            data.data.startX <= territory.endX) ||
          (data.data.endX >= territory.startX &&
            data.data.endX <= territory.endX) ||
          (data.data.startY >= territory.startY &&
            data.data.startY <= territory.endY) ||
          (data.data.endY >= territory.startY &&
            data.data.endY <= territory.endY)
        ) {
          throw new ConflictException({
            error: 'intersects-existing-territory',
          });
        }
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
            description: `8Land territory at ${land.name}. This is territory number ${territoryNumber}.`,
            image: `${this.storageService.getHostUrl()}/${thumbnailStorageKey}`,
            name: `${land.name} - territory ${territoryNumber}`,
          }),
        );
      } catch (err) {
        await this.storageService.removeFile(thumbnailStorageKey);
        throw err;
      }

      // const web3 = this.alchemyWeb3Service.getAlchemyWeb3();

      // const nftContract = new web3.eth.Contract(
      //   territoryNFTContractJSON.abi as unknown as AbiItem,
      //   EnvironmentVariablesService.variables.TERRITORY_NFT_CONTRACT_ADDRESS,
      // ) as unknown as TerritoryNFT;

      // const nonce = await web3.eth.getTransactionCount(
      //   EnvironmentVariablesService.variables.WALLET_PUBLIC_KEY,
      //   'latest',
      // );

      // const txBase = {
      //   from: EnvironmentVariablesService.variables.WALLET_PUBLIC_KEY,
      //   to: EnvironmentVariablesService.variables
      //     .TERRITORY_NFT_CONTRACT_ADDRESS,
      //   nonce,
      //   data: nftContract.methods
      //     .mintNFT(
      //       EnvironmentVariablesService.variables.WALLET_PUBLIC_KEY,
      //       `${this.storageService.getHostUrl()}/${nftMetadataStorageKey}`,
      //     )
      //     .encodeABI(),
      // };

      // const gas = await web3.eth.estimateGas(txBase);

      // const tx = {
      //   ...txBase,
      //   gas,
      // };

      // const signedTx = await web3.eth.accounts.signTransaction(
      //   tx,
      //   EnvironmentVariablesService.variables.WALLET_PRIVATE_KEY,
      // );

      // await web3.eth.sendSignedTransaction(
      //   signedTx.rawTransaction || throwError(),
      // );
    });
  }
}
