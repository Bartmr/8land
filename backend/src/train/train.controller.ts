import {
  BadRequestException,
  ConflictException,
  Controller,
  Get,
  Logger,
  NotFoundException,
  NotImplementedException,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/users/auth/auth.guard';
import {
  GetTrainDestinationsDTO,
  GetTrainDestinationQueryDTO,
  BoardTrainDTO,
  BoardTrainParametersDTO,
  ReturnToTrainStationDTO,
  ReturnToTrainStationQueryDTO,
} from 'src/train/train.dtos';
import {
  AuthContext,
  WithOptionalAuthContext,
  PublicRoute,
} from 'src/users/auth/auth.guard';
import { getSearchableString } from 'src/strings/get-searchable-string';
import { throwError } from 'src/throw-error';
import { LandService } from 'src/land/land.service';
import { Land } from 'src/land/land.entities';
import { NavigationState } from 'src/navigation/state/navigation-state.entities';
import { DataSource } from 'typeorm';

@UseGuards(AuthGuard)
@Controller('/train')
export class TrainController {
  private logger = new Logger(TrainController.name)
  constructor(
    private dataSource: DataSource,
    private landService: LandService,
  ) {}

  @Get('/board/:worldId')
  @PublicRoute()
  async board(
    @Param() param: BoardTrainParametersDTO,
    @WithOptionalAuthContext() authContext?: AuthContext,
  ): Promise<BoardTrainDTO> {
    return this.dataSource.transaction(async (eM) => {
      const land = await eM.getRepository(Land)
        .createQueryBuilder('land')
        .leftJoinAndSelect('land.world', 'world')
        .where('world.id = :id', { id: param.worldId })
        .andWhere('land.isStartingLand = true')
        .orderBy('land.createdAt')
        .getOne();

      if (!land) {
        throw new NotFoundException();
      }

      if (!authContext) {
        return this.landService.toNavigateToLandDTO(land);
      } else {
        const navStatesRepository = eM.getRepository(NavigationState);

        let navState = await navStatesRepository.findOne({
          where: { user: { id: authContext.user.id } },
        });

        if (!navState) {
          navState = navStatesRepository.create({ user: Promise.resolve(authContext.user) });
          navState = await navStatesRepository.save(navState);
        }

        if (!navState.lastDoor) {
          throw new ConflictException({
            error: 'not-boarding-from-a-train-station',
          });
        }

        let trainStation: Land;

        if (!navState.lastDoor.inLand) {
          throw new NotImplementedException();
        }

        if (navState.cameBack) {
          trainStation = navState.lastDoor.inLand;
        } else {
          trainStation = navState.lastDoor.toLand;
        }

        if (!trainStation.isTrainStation) {
          throw new ConflictException({
            error: 'not-boarding-from-a-train-station',
          });
        }

        navState.lastDoor = null;
        navState.cameBack = null;
        navState.lastPlayedBackgroundMusicUrl = null;

        navState.traveledByTrainToLand = land;
        navState.boardedOnTrainStation = trainStation;

        await navStatesRepository.save(navState);

        return this.landService.toNavigateToLandDTO(land);
      }
    });
  }

  @Get('/return')
  @PublicRoute()
  async returnToTrainStation(
    @Query() query: ReturnToTrainStationQueryDTO,
    @WithOptionalAuthContext() authContext?: AuthContext,
  ): Promise<ReturnToTrainStationDTO> {
    if (authContext) {
      return this.dataSource.transaction(async (eM) => {
        const navStateRepo = eM.getRepository(NavigationState);

        let navState = await navStateRepo.findOne({
          where: { user: { id: authContext.user.id } },
        });

        if (!navState) {
          navState = navStateRepo.create({ user: Promise.resolve(authContext.user) });
          navState = await navStateRepo.save(navState);
        }

        const boardedOnTrainStation = navState.boardedOnTrainStation;

        if (boardedOnTrainStation) {
          navState.lastDoor = null;
          navState.cameBack = null;
          navState.lastPlayedBackgroundMusicUrl = null;
          navState.traveledByTrainToLand = null;
          navState.boardedOnTrainStation = null;

          await navStateRepo.save(navState);

          return this.landService.toNavigateToLandDTO(boardedOnTrainStation);
        } else {
          return this.landService.resume({
            eM,
            authContext,
          });
        }
      });
    } else {
      if (!query.boardedOnTrainStation) {
        throw new BadRequestException();
      }

      const trainStation = await this.dataSource.getRepository(Land).findOne({
        where: { id: query.boardedOnTrainStation },
      });

      if (!trainStation || !trainStation.isTrainStation) {
        throw new NotFoundException();
      }

      return this.landService.toNavigateToLandDTO(trainStation);
    }
  }

  @Get('/apps/tickets/getDestinations')
  @PublicRoute()
  async getTrainDestinations(
    @Query() query: GetTrainDestinationQueryDTO,
  ): Promise<GetTrainDestinationsDTO> {
    const limit = 50;

    let landQuery = this.dataSource.getRepository(Land)
      .createQueryBuilder('land')
      .leftJoinAndSelect('land.world', 'world')
      .orderBy('land.createdAt', 'DESC')
      .where('land.isStartingLand = true')
      .andWhere('land.world IS NOT NULL');

    if (query.name) {
      landQuery = landQuery.andWhere(
        'land.searchableName = :searchableName',
        { searchableName: getSearchableString(query.name) },
      );
    }

    const [rows, total] = await landQuery
      .skip(query.skip)
      .take(limit)
      .getManyAndCount();

    return {
      limit,
      total,
      rows: rows.map((r) => {
        return {
          name: r.name,
          worldId: r.world?.id ?? throwError(),
        };
      }),
    };
  }
}
