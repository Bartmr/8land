import {
  Controller,
  Get,
  Param,
  Query,
  BadRequestException,
  Body,
  ConflictException,
  ForbiddenException,
  HttpCode,
  Post,
  Put,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  Delete,
  NotFoundException,
} from '@nestjs/common';
import { AuthGuard } from 'src/users/auth/auth.guard';
import {
  GetLandDTO,
  GetLandParametersDTO,
} from 'src/land/get/get-land.dto';
import {
  IndexLandsDTO,
  IndexLandsQueryDTO,
} from 'src/land/index/index-lands.dto';
import { AuthContext } from 'src/users/auth/auth-context';
import { WithAuthContext } from 'src/users/auth/auth-context.decorator';
import { StorageService } from 'src/storage/storage.service';
import { DataSource } from 'typeorm';
import { LandsService } from './lands.service';
import { LandRepository } from './land.repository';

import { FileFieldsInterceptor } from '@nestjs/platform-express';
import {
  CreateLandRequestDTO,
  CreateLandResponseDTO,
} from 'src/land/create/create-land.dto';
import { UploadLandAssetsParameters } from 'src/land/upload-assets/upload-land-assets.dto';
import {
  EditLandBodyDTO,
  EditLandDTO,
  EditLandParametersDTO,
} from 'src/land/edit/edit-land.dto';
import { LandPersistenceService } from './land-persistence.service';
import { WorldRepository } from 'src/worlds/worlds.repository';
import { DeleteLandParametersDTO } from 'src/land/delete-land/delete-land.dto';
import { PublicRoute } from 'src/users/auth/public-route.decorator';
import { GetLandsToClaimDTO } from 'src/land/lands-to-claim/lands-to-claim.dto';
import { EnvironmentVariables } from 'src/environment-variables/environment-variables';

class LandAssetsRequestDTO {
  map!: unknown;
  tileset!: unknown;
}

// TODO redo all

@UseGuards(AuthGuard)
@Controller('lands')
export class LandsController {
  constructor(
    private dataSource: DataSource,
    private storageService: StorageService,
    private landService: LandsService,
    private landPersistenceService: LandPersistenceService,
  ) {}

  @Get()
  async indexLands(
    @Query() query: IndexLandsQueryDTO,
    @WithAuthContext() authContext: AuthContext,
  ): Promise<IndexLandsDTO> {
    const landsRepository = this.dataSource.getCustomRepository(LandRepository);
    const worldsRepository =
      this.dataSource.getCustomRepository(WorldRepository);

    const [results, world] = await Promise.all([
      landsRepository.selectManyAndCount(
        {
          alias: 'land',
          skip: query.skip || 0,
        },

        (qb) => {
          if (authContext.user.isAdmin) {
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
      worldsRepository.findOne({ where: { user: { id: authContext.user.id }} }),
    ]);

    if (!authContext.user.isAdmin && !world) {
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
          authContext.user.isAdmin
            ? !!c.hasAssets
            : !!(c.hasAssets && world?.hasStartLand),
        isStartingLand: !!c.isStartingLand,
      })),
    };
  }

  @Get('/getLandsToClaim')
  @PublicRoute()
  async getLandsToClaim(): Promise<GetLandsToClaimDTO> {
    const landsRepository = this.dataSource.getCustomRepository(LandRepository);

    const landsWithStartCount = await landsRepository.count({
        where: {
          isStartingLand: true,
        },
      })

    return {
      free: EnvironmentVariables.START_LANDS_TOTAL_LIMIT - landsWithStartCount,
    };
  }

  @Get('/getEditable/:id')
  async getLand(
    @Param() parameters: GetLandParametersDTO,
    @WithAuthContext() authContext: AuthContext,
  ): Promise<GetLandDTO> {
    const landsRepository = this.dataSource.getCustomRepository(LandRepository);

    const land = await landsRepository.selectOne(
      {
        alias: 'land',
      },

      (qb) => {
        let resQb = qb;

        resQb = resQb.where('land.id = :id', { id: parameters.id });

        if (!authContext.user.isAdmin) {
          resQb = resQb
            .leftJoinAndSelect('land.world', 'world')
            .andWhere('world.user = :userId', { userId: authContext.user.id });
        }

        return resQb;
      },
    );

    if (!land) {
      throw new NotFoundException();
    } else {
      return this.landService.toGetLandDTO(land);
    }
  }

  @Post()
  async createLand(
    @Body() body: CreateLandRequestDTO,
    @WithAuthContext() authContext: AuthContext,
  ): Promise<CreateLandResponseDTO> {
    const limit = EnvironmentVariables.LAND_LIMIT_PER_WORLD;

    const res = await this.landPersistenceService.createLand({
      connection: this.dataSource,
      body,
      authContext,
      limitations: {
        limitQuantity: !authContext.user.isAdmin ? limit : undefined,
        useWorld: !authContext.user.isAdmin,
      },
    });

    if (res.error === "name-already-taken") {
      throw new ConflictException({ error: res.error });
    } else if (res.error === 'lands-limit-exceeded') {
      throw new ConflictException({ error: res.error, limit });
    } else if (res.error === "cannot-create-more-lands-without-start-block") {
      throw new ConflictException({ error: res.error });
    } else if (res.res) {
      return res.res;
    } else {
      throw new Error()
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
  async uploadLandAssets(
    @Param() params: UploadLandAssetsParameters,
    @UploadedFiles()
    files: { map?: Express.Multer.File[]; tileset?: Express.Multer.File[] },
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
      connection: this.dataSource,
      storageService: this.storageService,
      map,
      tileset,
      params,
      authContext,
    });

    if (res.status === 'ok') {
      return;
    } else if (res.status === 'not-found') {
      throw new NotFoundException({ error: res.status });
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
    @WithAuthContext() authContext: AuthContext,
  ): Promise<EditLandDTO> {
    const res = await this.landPersistenceService.editLand({
      connection: this.dataSource,
      body,
      param,
      authContext,
    });

    if (res.status === 'ok') {
      return res.data;
    } else if (res.status === 'not-found') {
      throw new NotFoundException({ error: res.status });
    } else {
      throw new ConflictException({ error: res.status });
    }
  }

  @Delete(':landId')
  async deleteLand(
    @Param() param: DeleteLandParametersDTO,
    @WithAuthContext() authContext: AuthContext,
  ): Promise<void> {
    if (!authContext.user.isAdmin) {
      throw new ForbiddenException();
    }

    const res = await this.landPersistenceService.deleteLand({
      landId: param.landId,
      connection: this.dataSource,
      storageService: this.storageService,
      authContext,
    });

    if (res.status === 'ok') {
      return;
    } else if (res.status === 'not-found') {
      throw new NotFoundException({ error: res.status });
    } else {
      throw new ConflictException({ error: res.status });
    }
  }
}
