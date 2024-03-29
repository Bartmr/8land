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
  Delete,
} from '@nestjs/common';
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
import { LandsService } from './lands.service';
import { LandRepository } from './typeorm/land.repository';

import { FileFieldsInterceptor } from '@nestjs/platform-express';
import {
  CreateLandRequestDTO,
  CreateLandResponseDTO,
} from 'libs/shared/src/land/create/create-land.dto';
import { UploadLandAssetsParameters } from 'libs/shared/src/land/upload-assets/upload-land-assets.dto';
import { RolesUpAndIncluding } from 'src/auth/roles/roles.decorator';
import { AuditContext } from 'src/internals/auditing/audit-context';
import { WithAuditContext } from 'src/internals/auditing/audit.decorator';
import { ApiBody, ApiConsumes, ApiProperty } from '@nestjs/swagger';
import {
  EditLandBodyDTO,
  EditLandDTO,
  EditLandParametersDTO,
} from 'libs/shared/src/land/edit/edit-land.dto';
import { LandPersistenceService } from './land-persistence.service';
import { WorldRepository } from 'src/worlds/worlds.repository';
import { DeleteLandParametersDTO } from 'libs/shared/src/land/delete-land/delete-land.dto';
import { SettingsService } from 'src/settings/settings.service';
import { PublicRoute } from 'src/auth/public-route.decorator';
import { GetLandsToClaimDTO } from 'libs/shared/src/land/lands-to-claim/lands-to-claim.dto';
import { InjectTypeormConnection } from 'src/internals/databases/inject-typeorm-connection.decorator';

class LandAssetsRequestDTO {
  @ApiProperty({ type: 'string', format: 'binary' })
  map!: unknown;
  @ApiProperty({ type: 'string', format: 'binary' })
  tileset!: unknown;
}

// TODO redo all

@Controller('lands')
export class LandsController {
  constructor(
    @InjectTypeormConnection() private connection: Connection,
    private storageService: StorageService,
    private landService: LandsService,
    private landPersistenceService: LandPersistenceService,
    private settingsService: SettingsService,
  ) {}

  @Get()
  async indexLands(
    @Query() query: IndexLandsQueryDTO,
    @WithAuthContext() authContext: AuthContext,
  ): Promise<IndexLandsDTO> {
    const landsRepository = this.connection.getCustomRepository(LandRepository);
    const worldsRepository =
      this.connection.getCustomRepository(WorldRepository);

    const [results, world] = await Promise.all([
      landsRepository.selectManyAndCount(
        {
          alias: 'land',
          skip: query.skip || 0,
        },

        (qb) => {
          if (authContext.user.role === Role.Admin) {
            return qb
              .orderBy('land.createdAt', 'DESC')
              .where('land.world IS NULL');
          } else {
            return qb
              .orderBy('land.createdAt')
              .leftJoinAndSelect('land.world', 'world')
              .where('world.user = :id', { id: authContext.user.id });
          }
        },
      ),
      worldsRepository.findOne({ where: { user: authContext.user.id } }),
    ]);

    if (authContext.user.role !== Role.Admin && !world) {
      return {
        total: 0,
        limit: results.limit,
        lands: [],
      };
    }

    return {
      total: results.total,
      limit: results.limit,
      lands: results.rows.map((c) => ({
        id: c.id,
        name: c.name,
        published:
          authContext.user.role === Role.Admin
            ? !!c.hasAssets
            : !!(c.hasAssets && world?.hasStartLand),
        isStartingLand: !!c.isStartingLand,
      })),
    };
  }

  @Get('/getLandsToClaim')
  @PublicRoute()
  async getLandsToClaim(): Promise<GetLandsToClaimDTO> {
    const landsRepository = this.connection.getCustomRepository(LandRepository);

    const [landsWithStartCount, settings] = await Promise.all([
      landsRepository.count({
        where: {
          isStartingLand: true,
        },
      }),
      this.settingsService.getSettings(),
    ]);

    return {
      free: settings.startLandsTotalLimit - landsWithStartCount,
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
            .andWhere('world.user = :userId', { userId: authContext.user.id });
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
  async createLand(
    @Body() body: CreateLandRequestDTO,
    @WithAuditContext() auditContext: AuditContext,
    @WithAuthContext() authContext: AuthContext,
  ): Promise<CreateLandResponseDTO> {
    const settings = await this.settingsService.getSettings();
    const limit = settings.landLimitPerWorld;

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
    @WithAuthContext() authContext: AuthContext,
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

    const res = await this.landPersistenceService.uploadLandAssets({
      connection: this.connection,
      storageService: this.storageService,
      map,
      tileset,
      params,
      auditContext,
      authContext,
      settingsService: this.settingsService,
    });

    if (res.status === 'ok') {
      return;
    } else if (res.status === 'not-found') {
      throw new ResourceNotFoundException({ error: res.status });
    } else if (
      res.status === 'map-exceeds-file-size-limit' ||
      res.status === 'tileset-exceeds-file-size-limit' ||
      res.status === 'unrecognized-tileset-format' ||
      res.status === 'tileset-dimensions-dont-match' ||
      res.status === 'unparsable-map-json' ||
      res.status === 'tiled-json-validation-error'
    ) {
      throw new BadRequestException({ error: res.status });
    } else {
      throw new ConflictException({ error: res.status });
    }
  }

  @Put(':landId')
  async editLand(
    @Param() param: EditLandParametersDTO,
    @Body() body: EditLandBodyDTO,
    @WithAuditContext() auditContext: AuditContext,
    @WithAuthContext() authContext: AuthContext,
  ): Promise<EditLandDTO> {
    const res = await this.landPersistenceService.editLand({
      connection: this.connection,
      auditContext,
      body,
      param,
      authContext,
    });

    if (res.status === 'ok') {
      return res.data;
    } else if (res.status === 'not-found') {
      throw new ResourceNotFoundException();
    } else {
      throw new ConflictException({ error: res.status });
    }
  }

  @Delete(':landId')
  @RolesUpAndIncluding(Role.Admin)
  async deleteLand(
    @Param() param: DeleteLandParametersDTO,
    @WithAuthContext() authContext: AuthContext,
  ): Promise<void> {
    const res = await this.landPersistenceService.deleteLand({
      landId: param.landId,
      connection: this.connection,
      storageService: this.storageService,
      authContext,
    });

    if (res.status === 'ok') {
      return;
    } else if (res.status === 'not-found') {
      throw new ResourceNotFoundException();
    } else {
      throw new ConflictException({ error: res.status });
    }
  }
}
