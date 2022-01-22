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
// import { AbiItem } from 'web3-utils';
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
import { AlchemyWeb3Service } from 'src/internals/apis/alchemy/alchemy-web3.service';
// import { EnvironmentVariablesService } from 'src/internals/environment/environment-variables.service';
// import territoryNFTContract from 'libs/smart-contracts/artifacts/contracts/TerritoryNFT.sol/TerritoryNFT.json'

@Controller('territories')
export class TerritoriesController {
  constructor(
    @InjectConnection() private connection: Connection,
    private storageService: StorageService,
    private alchemyWeb3Service: AlchemyWeb3Service,
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

      for (const territory of land.territories) {
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
          blocks: [],
        },
        auditContext,
      );

      const thumbnailStorageKey = `territories/${territory.id}/thumbnail.jpg`;

      await this.storageService.saveBuffer(thumbnailStorageKey, imgResized);

      const nftMetadataStorageKey = `territories/${territory.id}/nft-metadata.json`;

      try {
        await this.storageService.saveText(
          nftMetadataStorageKey,
          JSON.stringify({
            attributes: [],
            description: `8Land territory at ${land.name}`,
            image: `${this.storageService.getHostUrl()}/${thumbnailStorageKey}`,
            name: `${land.name} - territory ${land.territories.length + 1}`,
          }),
        );
      } catch (err) {
        await this.storageService.removeFile(thumbnailStorageKey);
        throw err;
      }

      // const web3 = this.alchemyWeb3Service.getAlchemyWeb3()
      // const nftContract = new web3.eth.Contract(territoryNFTContract.abi as unknown as AbiItem, EnvironmentVariablesService.variables.TERRITORY_NFT_CONTRACT_ADDRESS)
    });
  }
}
