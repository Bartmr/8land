import {
  Controller,
  Get,
  Param,
  Query,
  BadRequestException,
  Body,
  ConflictException,
  HttpCode,
  Post,
  Put,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import {
  GetLandDTO,
  GetLandParametersDTO,
} from 'libs/shared/src/land/get/get-land.dto';
import {
  IndexLandsDTO,
  IndexLandsQueryDTO,
} from 'libs/shared/src/land/index/index-lands.dto';
import { AuthContext } from 'src/auth/auth-context';
import { WithAuthContext } from 'src/auth/auth-context.decorator';
import { Role } from 'src/auth/roles/roles';
import { ResourceNotFoundException } from 'src/internals/server/resource-not-found.exception';
import { StorageService } from 'src/internals/storage/storage.service';
import { Connection } from 'typeorm';
import { LandsService } from '../lands.service';
import { Land } from '../typeorm/land.entity';
import { LandRepository } from '../typeorm/land.repository';

import { FileFieldsInterceptor } from '@nestjs/platform-express';
import {
  CreateLandRequestDTO,
  CreateLandResponseDTO,
} from 'libs/shared/src/land/create/create-land.dto';
import { UploadLandAssetsParameters } from 'libs/shared/src/land/upload-assets/upload-land-assets.dto';
import { RolesUpAndIncluding } from 'src/auth/roles/roles.decorator';
import { AuditContext } from 'src/internals/auditing/audit-context';
import { WithAuditContext } from 'src/internals/auditing/audit.decorator';
import { getSearchableName } from 'src/internals/utils/get-searchable-name';
import { ApiBody, ApiConsumes, ApiProperty } from '@nestjs/swagger';
import {
  EditLandBodyDTO,
  EditLandDTO,
  EditLandParametersDTO,
} from 'libs/shared/src/land/edit/edit-land.dto';
import { LandPersistenceService } from '../land-persistence.service';

class LandAssetsRequestDTO {
  @ApiProperty({ type: 'string', format: 'binary' })
  map!: unknown;
  @ApiProperty({ type: 'string', format: 'binary' })
  tileset!: unknown;
}

@Controller('lands')
export class LandsController {
  constructor(
    @InjectConnection() private connection: Connection,
    private storageService: StorageService,
    private landService: LandsService,
    private landPersistenceService: LandPersistenceService,
  ) {}

  @Get()
  async indexLands(
    @Query() query: IndexLandsQueryDTO,
    @WithAuthContext() authContext: AuthContext,
  ): Promise<IndexLandsDTO> {
    const landsRepository = this.connection.getCustomRepository(LandRepository);

    let results: {
      limit: number;
      rows: Land[];
      total: number;
    };

    if (authContext.user.role === Role.Admin) {
      results = await landsRepository.find({
        order: {
          createdAt: 'DESC',
        },
        skip: query.skip,
      });
    } else {
      results = await landsRepository.selectManyAndCount(
        {
          alias: 'land',
          skip: query.skip || 0,
        },

        (qb) =>
          qb
            .orderBy('land.createdAt')
            .leftJoinAndSelect('land.world', 'world')
            .where('world.user = :id', { id: authContext.user.id }),
      );
    }

    return {
      total: results.total,
      limit: results.limit,
      lands: results.rows.map((c) => ({
        id: c.id,
        name: c.name,
        published: !!c.hasAssets,
        isStartingLand: !!c.isStartingLand,
      })),
    };
  }

  @Get('/getEditable/:id')
  async getLand(
    @Param() parameters: GetLandParametersDTO,
    @WithAuthContext() authContext: AuthContext,
  ): Promise<GetLandDTO> {
    const landsRepository = this.connection.getCustomRepository(LandRepository);

    const land = await landsRepository.selectOne(
      {
        alias: 'land',
      },

      (qb) => {
        let resQb = qb;

        resQb = resQb.where('land.id = :id', { id: parameters.id });

        if (authContext.user.role !== Role.Admin) {
          resQb = resQb
            .leftJoinAndSelect('land.world', 'world')
            .andWhere('world.user = :id', { id: authContext.user.id });
        }

        return resQb;
      },
    );

    if (!land) {
      throw new ResourceNotFoundException();
    } else {
      return this.landService.mapLand(land);
    }
  }

  @Post()
  @RolesUpAndIncluding(Role.Admin)
  async createLand(
    @Body() body: CreateLandRequestDTO,
    @WithAuditContext() auditContext: AuditContext,
    @WithAuthContext() authContext: AuthContext,
  ): Promise<CreateLandResponseDTO> {
    const limit = 10;

    const res = await this.landPersistenceService.createLand({
      connection: this.connection,
      body,
      authContext,
      auditContext,
      limitations: {
        limitQuantity: authContext.user.role != Role.Admin ? limit : undefined,
        useWorld: authContext.user.role != Role.Admin,
      },
    });

    if (res.error) {
      if (res.error === 'lands-limit-exceeded') {
        throw new ConflictException({ error: res.error, limit });
      } else {
        throw new ConflictException({ error: res.error });
      }
    } else {
      return res.res;
    }
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

    await this.landPersistenceService.uploadLandAssets({
      connection: this.connection,
      storageService: this.storageService,
      map,
      tileset,
      params,
      auditContext,
      limitations: {
        allowStartBlock: false,
        allowTrainBlock: false,
      },
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
}
