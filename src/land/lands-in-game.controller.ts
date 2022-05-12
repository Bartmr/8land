import {
  Controller,
  Get,
  NotImplementedException,
  Query,
} from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { GetLandDTO } from 'libs/shared/src/land/get/get-land.dto';
import { NavigateToLandQueryDTO } from 'libs/shared/src/land/in-game/navigate/navigate-to-land.schemas';
import { ResumeLandNavigationDTO } from 'libs/shared/src/land/in-game/resume/resume-land-navigation.dto';
import { AuthContext } from 'src/auth/auth-context';
import { WithOptionalAuthContext } from 'src/auth/auth-context.decorator';
import { PublicRoute } from 'src/auth/public-route.decorator';
import { DoorBlockRepository } from 'src/blocks/typeorm/door-block.repository';
import { AuditContext } from 'src/internals/auditing/audit-context';
import { WithAuditContext } from 'src/internals/auditing/audit.decorator';
import { LoggingService } from 'src/internals/logging/logging.service';
import { ResourceNotFoundException } from 'src/internals/server/resource-not-found.exception';
import { NavigationStateRepository } from 'src/users/typeorm/navigation-state.repository';
import { Connection } from 'typeorm';
import { LandsService } from './lands.service';
import { LandRepository } from './typeorm/land.repository';

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
    if (authContext) {
      const navigationStateRepository = this.connection.getCustomRepository(
        NavigationStateRepository,
      );

      const navState =
        await navigationStateRepository.getNavigationStateFromUser(
          authContext.user,
          { auditContext },
        );

      if (navState.lastDoor) {
        if (navState.isComingBack) {
          if (navState.lastDoor.inLand) {
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
              lastCheckpointWasDeleted: !!navState.lastCheckpointWasDeleted,
            };
          } else {
            const territory = await navState.lastDoor.inTerritory;

            if (territory) {
              throw new NotImplementedException();
            } else {
              throw new Error();
            }
          }
        } else {
          const land = await this.landService.mapLand(navState.lastDoor.toLand);

          return {
            ...land,
            backgroundMusicUrl:
              land.backgroundMusicUrl || navState.lastPlayedBackgroundMusicUrl,
            lastDoor: {
              id: navState.lastDoor.id,
              toLandId: navState.lastDoor.toLand.id,
            },
            lastCheckpointWasDeleted: !!navState.lastCheckpointWasDeleted,
          };
        }
      }
    }

    const landsRepository = this.connection.getCustomRepository(LandRepository);

    const results = await landsRepository.find({
      order: {
        createdAt: 'ASC',
      },
      where: {
        hasAssets: true,
      },
      skip: 0,
    });

    const firstLand = results.rows[0];

    if (!firstLand) {
      throw new Error();
    }

    const land = await this.landService.mapLand(firstLand);

    return {
      ...land,
      lastDoor: null,
      lastCheckpointWasDeleted: false,
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
        navState.lastSavedAt = new Date();
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
          const inTerritory = await doorBlock.inTerritory;

          if (inTerritory) {
            // player came back
            // player entered
            throw new NotImplementedException();
          } else {
            throw new Error();
          }
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

      return res;
    } else {
      const inTerritory = await doorBlock.inTerritory;

      if (inTerritory) {
        // player came back
        // player entered
        throw new NotImplementedException();
      } else {
        throw new Error();
      }
    }
  }
}
