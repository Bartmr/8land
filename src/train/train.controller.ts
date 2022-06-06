import {
  BadRequestException,
  ConflictException,
  Controller,
  Get,
  NotImplementedException,
  Param,
  Query,
} from '@nestjs/common';
import {
  GetTrainDestinationsDTO,
  GetTrainDestinationQueryDTO,
} from 'libs/shared/src/train/apps/tickets/get-destinations/get-train-destinations.dto';
import {
  BoardTrainDTO,
  BoardTrainParametersDTO,
} from 'libs/shared/src/train/board/board-train.dto';
import {
  ReturnToTrainStationDTO,
  ReturnToTrainStationQueryDTO,
} from 'libs/shared/src/train/return/return-to-train-station.dto';
import { getTypesafeObjectFieldPath } from 'not-me/lib/utils/get-typesafe-object-field-path';
import { AuthContext } from 'src/auth/auth-context';
import { WithOptionalAuthContext } from 'src/auth/auth-context.decorator';
import { PublicRoute } from 'src/auth/public-route.decorator';
import { AuditContext } from 'src/internals/auditing/audit-context';
import { WithAuditContext } from 'src/internals/auditing/audit.decorator';
import { LoggingService } from 'src/internals/logging/logging.service';
import { ResourceNotFoundException } from 'src/internals/server/resource-not-found.exception';
import { getSearchableName } from 'src/internals/utils/get-searchable-name';
import { throwError } from 'src/internals/utils/throw-error';
import { LandsService } from 'src/land/lands.service';
import { Land } from 'src/land/typeorm/land.entity';
import { LandRepository } from 'src/land/typeorm/land.repository';
import { NavigationStateRepository } from 'src/users/typeorm/navigation-state.repository';
import { Connection } from 'typeorm';

@Controller('/train')
export class TrainController {
  constructor(
    private connection: Connection,
    private landsService: LandsService,
    private loggingService: LoggingService,
  ) {}

  @Get('/board/:worldId')
  @PublicRoute()
  async board(
    @Param() param: BoardTrainParametersDTO,
    @WithAuditContext() auditContext: AuditContext,
    @WithOptionalAuthContext() authContext?: AuthContext,
  ): Promise<BoardTrainDTO> {
    return this.connection.transaction(async (eM) => {
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
            .where('world.user = :id', { id: param.worldId }),
      );

      if (!land) {
        throw new ResourceNotFoundException();
      }

      if (!authContext) {
        return this.landsService.mapLand(land);
      } else {
        const navState = await navStatesRepository.getNavigationStateFromUser(
          authContext.user,
          { auditContext },
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

        await navStatesRepository.save(navState, auditContext);

        return this.landsService.mapLand(land);
      }
    });
  }

  @Get('/return')
  @PublicRoute()
  async returnToTrainStation(
    @Query() query: ReturnToTrainStationQueryDTO,
    @WithAuditContext() auditContext: AuditContext,
    @WithOptionalAuthContext() authContext?: AuthContext,
  ): Promise<ReturnToTrainStationDTO> {
    if (authContext) {
      return this.connection.transaction(async (eM) => {
        const navStateRepo = eM.getCustomRepository(NavigationStateRepository);

        const navState = await navStateRepo.getNavigationStateFromUser(
          authContext.user,
          { auditContext },
        );

        const boardedOnTrainStation = navState.boardedOnTrainStation;

        if (boardedOnTrainStation) {
          navState.lastDoor = null;
          navState.cameBack = null;
          navState.lastPlayedBackgroundMusicUrl = null;
          navState.traveledByTrainToLand = null;
          navState.boardedOnTrainStation = null;

          await navStateRepo.save(navState, auditContext);

          return this.landsService.mapLand(boardedOnTrainStation);
        } else {
          return this.landsService.resume({
            eM,
            loggingService: this.loggingService,
            auditContext,
            authContext,
          });
        }
      });
    } else {
      if (!query.boardedOnTrainStation) {
        throw new BadRequestException();
      }

      const landsRepository =
        this.connection.getCustomRepository(LandRepository);

      const trainStation = await landsRepository.findOne({
        where: { id: query.boardedOnTrainStation },
      });

      if (!trainStation || !trainStation.isTrainStation) {
        throw new ResourceNotFoundException();
      }

      return this.landsService.mapLand(trainStation);
    }
  }

  @Get('/apps/tickets/getDestinations')
  @PublicRoute()
  async getTrainDestinations(
    @Query() query: GetTrainDestinationQueryDTO,
  ): Promise<GetTrainDestinationsDTO> {
    const landsRepo = this.connection.getCustomRepository(LandRepository);

    const res = await landsRepo.selectManyAndCount(
      {
        alias: 'land',
        skip: query.skip,
      },
      (qB) => {
        let qBFinal = qB
          .orderBy(
            getTypesafeObjectFieldPath<Land>().and('createdAt').end(),
            'DESC',
          )
          .where(
            `lands.${getTypesafeObjectFieldPath<Land>()
              .and('isStartingLand')
              .end()} = true`,
          )
          .andWhere(
            `lands.${getTypesafeObjectFieldPath<Land>()
              .and('world')
              .end()} IS NOT NULL`,
          );

        if (query.name) {
          qBFinal = qBFinal.andWhere(
            `land.${getTypesafeObjectFieldPath<Land>()
              .and('searchableName')
              .end()} = :searchableName`,
            { searchableName: getSearchableName(query.name) },
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
