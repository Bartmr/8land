import {
  BadRequestException,
  Controller,
  Get,
  NotImplementedException,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/users/auth/auth.guard';
import { GetLandDTO } from '@shared/src/land/get/get-land.dto';
import {
  NavigateToLandDTO,
  NavigateToLandQueryDTO,
} from '@shared/src/land/in-game/navigate/navigate-to-land.dto';
import { ResumeLandNavigationDTO } from '@shared/src/land/in-game/resume/resume-land-navigation.dto';
import { AuthContext } from 'src/users/auth/auth-context';
import {
  WithAuthContext,
  WithOptionalAuthContext,
} from 'src/users/auth/auth-context.decorator';
import { PublicRoute } from 'src/users/auth/public-route.decorator';
import { DoorBlockRepository } from 'src/blocks/door-block.repository';
import { AuditContext } from 'src/auditing/audit-context';
import { WithAuditContext } from 'src/auditing/audit.decorator';
import { LoggingService } from 'src/logging/logging.service';
import { ResourceNotFoundException } from 'src/server/resource-not-found.exception';
import { NavigationStateRepository } from 'src/users/navigation-state.repository';
import { DataSource } from 'typeorm';
import { LandsService } from './lands.service';

@UseGuards(AuthGuard)
@Controller('lands')
export class LandsInGameController {
  constructor(
    private dataSource: DataSource,
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
      eM: this.dataSource.manager,
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
      this.dataSource.getCustomRepository(DoorBlockRepository);

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
        const navigationStateRepository = this.dataSource.getCustomRepository(
          NavigationStateRepository,
        );

        const navState =
          await navigationStateRepository.getNavigationStateFromUser(
            authContext.user,
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
    return this.dataSource.transaction(async (eM) => {
      const navigationStatesRepository = eM.getCustomRepository(
        NavigationStateRepository,
      );

      const navigationState =
        await navigationStatesRepository.getNavigationStateFromUser(
          authContext.user,
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
