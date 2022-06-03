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
  BoardTrainDTO,
  BoardTrainParametersDTO,
} from 'libs/shared/src/train/board-train.dto';
import {
  ReturnToTrainStationDTO,
  ReturnToTrainStationQueryDTO,
} from 'libs/shared/src/train/return-to-train-station.dto';
import { AuthContext } from 'src/auth/auth-context';
import { WithOptionalAuthContext } from 'src/auth/auth-context.decorator';
import { PublicRoute } from 'src/auth/public-route.decorator';
import { AuditContext } from 'src/internals/auditing/audit-context';
import { WithAuditContext } from 'src/internals/auditing/audit.decorator';
import { LoggingService } from 'src/internals/logging/logging.service';
import { ResourceNotFoundException } from 'src/internals/server/resource-not-found.exception';
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
}
