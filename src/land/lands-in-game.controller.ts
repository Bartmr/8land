import {
  BadRequestException,
  Controller,
  Get,
  NotImplementedException,
  Put,
  Query,
} from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { GetLandDTO } from 'libs/shared/src/land/get/get-land.dto';
import {
  NavigateToLandDTO,
  NavigateToLandQueryDTO,
} from 'libs/shared/src/land/in-game/navigate/navigate-to-land.dto';
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
import { NavigationStateRepository } from 'src/users/typeorm/navigation-state.repository';
import { Connection } from 'typeorm';
import { LandsService } from './lands.service';

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
    return this.landService.resume({
      eM: this.connection.manager,
      loggingService: this.loggingService,
      auditContext,
      authContext,
    });
  }

  @Get('/navigate')
  @PublicRoute()
  async navigate(
    @Query() query: NavigateToLandQueryDTO,
    @WithAuditContext() auditContext: AuditContext,
    @WithOptionalAuthContext() authContext?: AuthContext,
  ): Promise<NavigateToLandDTO> {
    const doorBlocksRepository =
      this.connection.getCustomRepository(DoorBlockRepository);

    const doorBlock = await doorBlocksRepository.findOne({
      where: { id: query.doorBlockId },
    });

    if (!doorBlock) {
      throw new ResourceNotFoundException();
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

        await navigationStateRepository.save(navState, auditContext);
      })().catch((err: unknown) =>
        this.loggingService.logError('navigate:save-state', err),
      );
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

      const navigationState =
        await navigationStatesRepository.getNavigationStateFromUser(
          authContext.user,
          { auditContext },
        );

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
      await navigationStatesRepository.save(navigationState, auditContext);
    });
  }
}
