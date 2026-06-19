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
  Logger,
  NotImplementedException,
} from '@nestjs/common';
import { AuthGuard } from 'src/users/auth/auth.guard';
import {
  GetLandDTO,
  GetLandParametersDTO,
  IndexLandsDTO,
  IndexLandsQueryDTO,
  CreateLandRequestDTO,
  CreateLandResponseDTO,
  UploadLandAssetsParameters,
  EditLandBodyDTO,
  EditLandDTO,
  EditLandParametersDTO,
  DeleteLandParametersDTO,
  GetLandsToClaimDTO,
  NavigateToLandDTO,
  NavigateToLandQueryDTO,
  ResumeLandNavigationDTO,
} from 'src/land/land.dtos';
import {
  AuthContext,
  WithAuthContext,
  WithOptionalAuthContext,
  PublicRoute,
} from 'src/users/auth/auth.guard';
import { StorageService } from 'src/storage/storage.service';
import { DataSource } from 'typeorm';

import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { LandService } from './land.service';
import { Land } from './land.entities';
import { World } from 'src/worlds/worlds.entities';
import { EnvironmentVariables } from 'src/environment-variables/environment-variables';
import { DoorBlock } from 'src/blocks/door-block.entities';
import { NavigationState } from 'src/navigation/state/navigation-state.entities';
import { ZodValidationPipe } from 'src/zod/zod.pipe';
import {
  CreateLandRequestSchema,
  EditLandBodySchema,
} from 'src/land/land.dtos';

@UseGuards(AuthGuard)
@Controller('lands')
export class LandsController {
  private logger = new Logger(LandsController.name)

  constructor(
    private dataSource: DataSource,
    private storageService: StorageService,
    private landService: LandService,
  ) {}

  @Get()
  async indexLands(
    @Query() query: IndexLandsQueryDTO,
    @WithAuthContext() authContext: AuthContext,
  ): Promise<IndexLandsDTO> {
    const landsRepository = this.dataSource.getRepository(Land);
    const worldsRepository = this.dataSource.getRepository(World);

    const limit = 50;

    let landQuery = landsRepository
      .createQueryBuilder('land')
      .leftJoinAndSelect('land.world', 'world');

    if (authContext.user.isAdmin) {
      landQuery = landQuery
        .orderBy('land.createdAt', 'DESC')
        .where('land.world IS NULL');
    } else {
      landQuery = landQuery
        .orderBy('land.createdAt')
        .where('world.user = :id', { id: authContext.user.id });
    }

    const [rows, total] = await landQuery
      .skip(query.skip || 0)
      .take(limit)
      .getManyAndCount();

    const world = await worldsRepository.findOne({ where: { user: { id: authContext.user.id }} });

    if (!authContext.user.isAdmin && !world) {
      return {
        total: 0,
        limit,
        lands: [],
      };
    }

    return {
      total,
      limit,
      lands: rows.map((c) => ({
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
    const landsRepository = this.dataSource.getRepository(Land);

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
    const landsRepository = this.dataSource.getRepository(Land);

    let landQuery = landsRepository
      .createQueryBuilder('land')
      .where('land.id = :id', { id: parameters.id })
      .leftJoinAndSelect('land.world', 'world');

    if (!authContext.user.isAdmin) {
      landQuery = landQuery.andWhere('world.user = :userId', { userId: authContext.user.id });
    }

    const land = await landQuery.getOne();

    if (!land) {
      throw new NotFoundException();
    } else {
      return this.landService.toGetLandDTO(land);
    }
  }

  @Post()
  async createLand(
    @Body(new ZodValidationPipe(CreateLandRequestSchema)) body: CreateLandRequestDTO,
    @WithAuthContext() authContext: AuthContext,
  ): Promise<CreateLandResponseDTO> {
    const limit = EnvironmentVariables.LAND_LIMIT_PER_WORLD;

    const res = await this.landService.createLand({
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

    const res = await this.landService.uploadLandAssets({
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
    @Body(new ZodValidationPipe(EditLandBodySchema)) body: EditLandBodyDTO,
    @WithAuthContext() authContext: AuthContext,
  ): Promise<EditLandDTO> {
    const res = await this.landService.editLand({
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

    const res = await this.landService.deleteLand({
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

  @Get('/resume')
  @PublicRoute()
  async resumeLandNavigation(
    @WithOptionalAuthContext() authContext?: AuthContext,
  ): Promise<ResumeLandNavigationDTO> {
    return this.landService.resume({
      eM: this.dataSource.manager,
      authContext,
    });
  }

  @Get('/navigate')
  @PublicRoute()
  async navigate(
    @Query() query: NavigateToLandQueryDTO,
    @WithOptionalAuthContext() authContext?: AuthContext,
  ): Promise<NavigateToLandDTO> {
    const doorBlock = await this.dataSource.getRepository(DoorBlock).findOne({
      where: { id: query.doorBlockId },
    });

    if (!doorBlock) {
      throw new NotFoundException();
    }

    let res: GetLandDTO;

    if (doorBlock.inLand) {
      // player came back
      if (query.currentLandId == doorBlock.toLand.id) {
        res = await this.landService.toNavigateToLandDTO(doorBlock.inLand);
      }
      // player entered
      else if (query.currentLandId == doorBlock.inLand.id) {
        res = await this.landService.toNavigateToLandDTO(doorBlock.toLand);
      } else {
        throw new Error();
      }
    } else {
      throw new NotImplementedException();
    }

    if (!res.assets) {
      throw new NotFoundException();
    }

    if (authContext) {
      const navigationStateRepository = this.dataSource.getRepository(NavigationState);

      let navState = await navigationStateRepository.findOne({
        where: { user: { id: authContext.user.id } },
      });

      if (!navState) {
        navState = new NavigationState({ user: Promise.resolve(authContext.user) });
        navState = await navigationStateRepository.save(navState);
      }

      navState.lastDoor = doorBlock;

      let lastPlayedBackgroundMusicUrl: string | null;

      if (doorBlock.inLand) {
        // player came back
        if (query.currentLandId == doorBlock.toLand.id) {
          navState.cameBack = true;

          if (!doorBlock.inLand.world) {
            navState.traveledByTrainToLand = null;
            navState.boardedOnTrainStation = null;
          }

          lastPlayedBackgroundMusicUrl =
            doorBlock.inLand.backgroundMusicUrl ||
            navState.lastPlayedBackgroundMusicUrl;
        }
        // player entered
        else if (query.currentLandId == doorBlock.inLand.id) {
          navState.cameBack = false;

          if (!doorBlock.toLand.world) {
            navState.traveledByTrainToLand = null;
            navState.boardedOnTrainStation = null;
          }

          lastPlayedBackgroundMusicUrl =
            doorBlock.toLand.backgroundMusicUrl ||
            navState.lastPlayedBackgroundMusicUrl;
        } else {
          throw new BadRequestException();
        }
      } else {
        throw new NotImplementedException();
      }

      navState.lastPlayedBackgroundMusicUrl = lastPlayedBackgroundMusicUrl;

      await navigationStateRepository.save(navState);

    }

    return res;
  }

  @Put('/escape')
  async escape(
    @WithAuthContext() authContext: AuthContext,
  ) {
    return this.dataSource.transaction(async (eM) => {
      const navigationStatesRepository = eM.getRepository(NavigationState);

      let navigationState = await navigationStatesRepository.findOne({
        where: { user: { id: authContext.user.id } },
      });

      if (!navigationState) {
        navigationState = new NavigationState({ user: Promise.resolve(authContext.user) });
        navigationState = await navigationStatesRepository.save(navigationState);
      }

      const lastDoor = navigationState.lastDoor;
      const traveledByTrainToLand = navigationState.traveledByTrainToLand;

      navigationState.lastDoor = null;
      navigationState.traveledByTrainToLand = null;
      navigationState.cameBack = null;
      navigationState.lastPlayedBackgroundMusicUrl = null;

      if (
        navigationState.boardedOnTrainStation &&
        !lastDoor &&
        !traveledByTrainToLand
      ) {
        navigationState.boardedOnTrainStation = null;
      }

      if (lastDoor && !lastDoor.inLand) {
        // MEANS IT'S A BLOCK INSIDE A TERRITORY
        throw new NotImplementedException();
      }
      await navigationStatesRepository.save(navigationState);
    });
  }
}
