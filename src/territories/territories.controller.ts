import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  HttpCode,
  Param,
  Patch,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import {
  CreateTerritoryRequestDTO,
  CreateTerritoryResponseDTO,
} from 'libs/shared/src/territories/create/create-territory.dto';
import { CreateTerritoryRequestJSONSchema } from 'libs/shared/src/territories/create/create-territory.schemas';
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
import { ItselfStorageApi } from 'src/internals/apis/itself/itself-storage.api';
import { object } from 'not-me/lib/schemas/object/object-schema';
import { equals } from 'not-me/lib/schemas/equals/equals-schema';
import { number } from 'not-me/lib/schemas/number/number-schema';
import {
  UpdateTerritoryRaribleMetadataParametersDTO,
  UpdateTerritoryRaribleMetadataRequestDTO,
} from 'libs/shared/src/territories/update-rarible/update-territory-rarible-metadata.dto';
import { ResourceNotFoundException } from 'src/internals/server/resource-not-found.exception';

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
    type: CreateTerritoryRequestDTO,
  })
  async createTerritory(
    @UploadedFiles()
    files: {
      data?: Express.Multer.File[];
      thumbnail?: Express.Multer.File[];
    },
    @WithAuditContext() auditContext: AuditContext,
  ): Promise<CreateTerritoryResponseDTO> {
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
        kernel: 'nearest',
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

      const territories = await land.territories;
      const totalTerritories = await territoriesRepository.count({});

      for (const territory of territories) {
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
          tokenId: null,
          tokenAddress: null,
        },
        auditContext,
      );
      const thumbnailStorageKey = `territories/${territory.id}/thumbnail.jpg`;
      await this.storageService.saveBuffer(thumbnailStorageKey, imgResized);

      const territoryNumber = totalTerritories + 1;

      const nftMetadata = {
        name: `8Land Territory #${territoryNumber}`,
        description: `8Land territory at ${land.name}`,
        image: `${this.storageService.getHostUrl()}/${thumbnailStorageKey}`,
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
      };

      return {
        territoryId: territory.id,
        nftMetadata: nftMetadata,
      };
    });
  }

  @Patch(':id/rarible')
  @RolesUpAndIncluding(Role.Admin)
  @HttpCode(204)
  async updateRaribleMetadata(
    @Param() params: UpdateTerritoryRaribleMetadataParametersDTO,
    @Body() body: UpdateTerritoryRaribleMetadataRequestDTO,
    @WithAuditContext() auditContext: AuditContext,
  ) {
    return this.connection.transaction(async (eM) => {
      const territoriesRepository = eM.getCustomRepository(
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

      territory.tokenId = body.tokenId;
      territory.tokenAddress = body.tokenAddress;

      await territoriesRepository.save(territory, auditContext);
    });
  }
}
