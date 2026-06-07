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
} from 'src/train/apps/tickets/get-destinations/get-train-destinations.dto';
import {
  BoardTrainDTO,
  BoardTrainParametersDTO,
} from 'src/train/board/board-train.dto';
import {
  ReturnToTrainStationDTO,
  ReturnToTrainStationQueryDTO,
} from 'src/train/return/return-to-train-station.dto';
import { AuthContext } from 'src/users/auth/auth-context';
import { WithOptionalAuthContext } from 'src/users/auth/auth-context.decorator';
import { PublicRoute } from 'src/users/auth/public-route.decorator';
import { getSearchableString } from 'src/strings/get-searchable-string';
import { throwError } from 'src/throw-error';
import { LandsInGameService } from 'src/land/lands-in-game.service';
import { Land } from 'src/land/land.entity';
import { LandRepository } from 'src/land/land.repository';
import { NavigationStateRepository } from 'src/navigation/state/navigation-state.repository';
import { DataSource } from 'typeorm';

@UseGuards(AuthGuard)
@Controller('/train')
export class TrainController {
  private logger = new Logger(TrainController.name)
  constructor(
    private dataSource: DataSource,
    private landsInGameService: LandsInGameService,
  ) {}

  @Get('/board/:worldId')
  @PublicRoute()
  async board(
    @Param() param: BoardTrainParametersDTO,
    @WithOptionalAuthContext() authContext?: AuthContext,
  ): Promise<BoardTrainDTO> {
    return this.dataSource.transaction(async (eM) => {
      const landsRepository = eM.getCustomRepository(LandRepository);
      const navStatesRepository = eM.getCustomRepository(
        NavigationStateRepository,
      );

      const land = await landsRepository.selectOne(
        {
          alias: 'land',
        },

        (qb) =>
          qb
            .orderBy('land.createdAt')
            .leftJoinAndSelect('land.world', 'world')
            .andWhere(
              `land.isStartingLand = true`,
            )
            .where('world.id = :id', { id: param.worldId }),
      );

      if (!land) {
        throw new NotFoundException();
      }

      if (!authContext) {
        return this.landsInGameService.toInGameLandDTO(land);
      } else {
        const navState = await navStatesRepository.getNavigationStateFromUser(
          authContext.user,
        );

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

        return this.landsInGameService.toInGameLandDTO(land);
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
        const navStateRepo = eM.getCustomRepository(NavigationStateRepository);

        const navState = await navStateRepo.getNavigationStateFromUser(
          authContext.user,
        );

        const boardedOnTrainStation = navState.boardedOnTrainStation;

        if (boardedOnTrainStation) {
          navState.lastDoor = null;
          navState.cameBack = null;
          navState.lastPlayedBackgroundMusicUrl = null;
          navState.traveledByTrainToLand = null;
          navState.boardedOnTrainStation = null;

          await navStateRepo.save(navState);

          return this.landsInGameService.toInGameLandDTO(boardedOnTrainStation);
        } else {
          return this.landsInGameService.resume({
            eM,
            authContext,
          });
        }
      });
    } else {
      if (!query.boardedOnTrainStation) {
        throw new BadRequestException();
      }

      const landsRepository =
        this.dataSource.getCustomRepository(LandRepository);

      const trainStation = await landsRepository.findOne({
        where: { id: query.boardedOnTrainStation },
      });

      if (!trainStation || !trainStation.isTrainStation) {
        throw new NotFoundException();
      }

      return this.landsInGameService.toInGameLandDTO(trainStation);
    }
  }

  @Get('/apps/tickets/getDestinations')
  @PublicRoute()
  async getTrainDestinations(
    @Query() query: GetTrainDestinationQueryDTO,
  ): Promise<GetTrainDestinationsDTO> {
    const landsRepo = this.dataSource.getCustomRepository(LandRepository);

    const res = await landsRepo.selectManyAndCount(
      {
        alias: 'land',
        skip: query.skip,
      },
      (qB) => {
        let qBFinal = qB
          .orderBy(
            `land.createdAt`,
            'DESC',
          )
          .where(
            `land.isStartingLand = true`,
          )
          .andWhere(
            `land.world IS NOT NULL`,
          );

        if (query.name) {
          qBFinal = qBFinal.andWhere(
            `land.searchableName = :searchableName`,
            { searchableName: getSearchableString(query.name) },
          );
        }

        return qBFinal;
      },
    );

    return {
      limit: res.limit,
      total: res.total,
      rows: res.rows.map((r) => {
        return {
          name: r.name,
          worldId: r.world?.id ?? throwError(),
        };
      }),
    };
  }
}
