import {
  Controller,
  Get,
  NotImplementedException,
  Put,
  Query,
} from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { GetLandDTO } from 'libs/shared/src/land/get/get-land.dto';
import { NavigateToLandQueryDTO } from 'libs/shared/src/land/in-game/navigate/navigate-to-land.schemas';
import { ResumeLandNavigationDTO } from 'libs/shared/src/land/in-game/resume/resume-land-navigation.dto';
import { AuthContext } from 'src/auth/auth-context';
import {
  WithAuthContext,
  WithOptionalAuthContext,
} from 'src/auth/auth-context.decorator';
import { PublicRoute } from 'src/auth/public-route.decorator';
import { DoorBlockRepository } from 'src/blocks/typeorm/door-block.repository';
import { AuditContext } from 'src/internals/auditing/audit-context';
import { WithAuditContext } from 'src/internals/auditing/audit.decorator';
import { LoggingService } from 'src/internals/logging/logging.service';
import { ResourceNotFoundException } from 'src/internals/server/resource-not-found.exception';
import { NavigationState } from 'src/users/typeorm/navigation-state.entity';
import { NavigationStateRepository } from 'src/users/typeorm/navigation-state.repository';
import { TrainStateRepository } from 'src/users/typeorm/train-state.repository';
import { Connection } from 'typeorm';
import { LandsService } from './lands.service';
import { LandRepository } from './typeorm/land.repository';

// TODO redo all

@Controller('lands')
export class LandsInGameController {
  constructor(
    @InjectConnection() private connection: Connection,
    private landService: LandsService,
    private loggingService: LoggingService,
  ) {}

  @Get('/resume')
  @PublicRoute()
  async resumeLandNavigation(
    @WithAuditContext() auditContext: AuditContext,
    @WithOptionalAuthContext() authContext?: AuthContext,
  ): Promise<ResumeLandNavigationDTO> {
    const navigationStateRepository = this.connection.getCustomRepository(
      NavigationStateRepository,
    );

    let navState: NavigationState | undefined;

    if (authContext) {
      navState = await navigationStateRepository.getNavigationStateFromUser(
        authContext.user,
        { auditContext },
      );
    }

    if (navState) {
      if (navState.lastDoor) {
        if (navState.isComingBack) {
          if (navState.lastDoor.inLand) {
            if (
              navState.lastDoor.inLand.world &&
              !navState.lastDoor.inLand.world.hasStartLand
            ) {
              throw new Error(
                'Lands and worlds cannot loose their start block',
              );
            }
            const land = await this.landService.mapLand(
              navState.lastDoor.inLand,
            );

            return {
              ...land,
              backgroundMusicUrl:
                land.backgroundMusicUrl ||
                navState.lastPlayedBackgroundMusicUrl,
              lastDoor: {
                id: navState.lastDoor.id,
                toLandId: navState.lastDoor.inLand.id,
              },
              lastTrainTravel: null,
              lastCheckpointWasDeleted: !!navState.lastCheckpointWasDeleted,
            };
          } else {
            throw new NotImplementedException();
          }
        } else {
          if (
            navState.lastDoor.toLand.world &&
            !navState.lastDoor.toLand.world.hasStartLand
          ) {
            throw new Error('Lands and worlds cannot loose their start block');
          }

          const land = await this.landService.mapLand(navState.lastDoor.toLand);

          return {
            ...land,
            backgroundMusicUrl:
              land.backgroundMusicUrl || navState.lastPlayedBackgroundMusicUrl,
            lastDoor: {
              id: navState.lastDoor.id,
              toLandId: navState.lastDoor.toLand.id,
            },
            lastTrainTravel: null,
            lastCheckpointWasDeleted: !!navState.lastCheckpointWasDeleted,
          };
        }
      } else if (navState.traveledByTrainToLand) {
        const land = await this.landService.mapLand(
          navState.traveledByTrainToLand,
        );

        return {
          ...land,
          lastDoor: null,
          lastTrainTravel: {
            comingBackToStation: false,
          },
          lastCheckpointWasDeleted: !!navState.lastCheckpointWasDeleted,
        };
      } else if (navState.boardedOnTrainStation) {
        const land = await this.landService.mapLand(
          navState.boardedOnTrainStation,
        );

        return {
          ...land,
          lastDoor: null,
          lastTrainTravel: {
            comingBackToStation: false,
          },
          lastCheckpointWasDeleted: !!navState.lastCheckpointWasDeleted,
        };
      }
    }

    const landsRepository = this.connection.getCustomRepository(LandRepository);

    const firstLand = await landsRepository.selectOne(
      { alias: 'land' },
      (qB) => {
        return qB
          .where('land.hasAssets = :hasAssets', { hasAssets: true })
          .andWhere('land.world IS NULL')
          .orderBy('land.createdAt', 'ASC');
      },
    );

    if (!firstLand) {
      throw new Error();
    }

    const land = await this.landService.mapLand(firstLand);

    return {
      ...land,
      lastDoor: null,
      lastCheckpointWasDeleted: navState
        ? !!navState.lastCheckpointWasDeleted
        : false,
      lastTrainTravel: null,
    };
  }

  @Get('/navigate')
  @PublicRoute()
  async navigate(
    @Query() query: NavigateToLandQueryDTO,
    @WithAuditContext() auditContext: AuditContext,
    @WithOptionalAuthContext() authContext?: AuthContext,
  ): Promise<GetLandDTO> {
    const doorBlocksRepository =
      this.connection.getCustomRepository(DoorBlockRepository);

    const doorBlock = await doorBlocksRepository.findOne({
      where: { id: query.doorBlockId },
    });

    if (!doorBlock) {
      throw new ResourceNotFoundException();
    }

    if (authContext) {
      (async () => {
        const navigationStateRepository = this.connection.getCustomRepository(
          NavigationStateRepository,
        );

        const navState =
          await navigationStateRepository.getNavigationStateFromUser(
            authContext.user,
            { auditContext },
          );

        navState.lastDoor = doorBlock;
        navState.lastCheckpointWasDeleted = false;

        let lastPlayedBackgroundMusicUrl: string | null;

        if (doorBlock.inLand) {
          // player came back
          if (query.currentLandId == doorBlock.toLand.id) {
            navState.isComingBack = true;

            lastPlayedBackgroundMusicUrl =
              doorBlock.inLand.backgroundMusicUrl ||
              navState.lastPlayedBackgroundMusicUrl;
          }
          // player entered
          else if (query.currentLandId == doorBlock.inLand.id) {
            navState.isComingBack = false;

            lastPlayedBackgroundMusicUrl =
              doorBlock.toLand.backgroundMusicUrl ||
              navState.lastPlayedBackgroundMusicUrl;
          } else {
            throw new Error();
          }
        } else {
          throw new NotImplementedException();
        }

        navState.lastPlayedBackgroundMusicUrl = lastPlayedBackgroundMusicUrl;

        await navigationStateRepository.save(navState, auditContext);
      })().catch((err: unknown) =>
        this.loggingService.logError('navigate:save-state', err),
      );
    }

    let res: GetLandDTO;

    if (doorBlock.inLand) {
      // player came back
      if (query.currentLandId == doorBlock.toLand.id) {
        res = await this.landService.mapLand(doorBlock.inLand);
      }
      // player entered
      else if (query.currentLandId == doorBlock.inLand.id) {
        res = await this.landService.mapLand(doorBlock.toLand);
      } else {
        throw new Error();
      }
    } else {
      throw new NotImplementedException();
    }

    if (!res.assets) {
      throw new ResourceNotFoundException();
    }

    return res;
  }

  @Put('/escape')
  async escape(
    @WithAuthContext() authContext: AuthContext,
    @WithAuditContext() auditContext: AuditContext,
  ) {
    return this.connection.transaction(async (eM) => {
      const navigationStatesRepository = eM.getCustomRepository(
        NavigationStateRepository,
      );
      const trainStatesRepository =
        eM.getCustomRepository(TrainStateRepository);

      const navigationState =
        await navigationStatesRepository.getNavigationStateFromUser(
          authContext.user,
          { eM, auditContext },
        );

      const lastDoor = navigationState.lastDoor;

      navigationState.lastDoor = null;
      navigationState.traveledByTrainToLand = null;
      navigationState.isComingBack = null;
      navigationState.lastPlayedBackgroundMusicUrl = null;

      if (navigationState.boardedOnTrainStation) {
        const trainState = await trainStatesRepository.findOne({
          where: {
            boardedIn: navigationState.boardedOnTrainStation,
            user: authContext.user,
          },
        });

        if (trainState) {
          trainState.destinationLand = null;
          await trainStatesRepository.save(trainState, auditContext);
        }

        await navigationStatesRepository.save(navigationState, auditContext);
      } else if (lastDoor && !lastDoor.inLand) {
        // MEANS IT'S A BLOCK INSIDE A TERRITORY
        throw new NotImplementedException();
      } else {
        navigationState.boardedOnTrainStation = null;
      }
    });
  }
}
