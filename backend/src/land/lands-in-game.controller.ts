import {
  BadRequestException,
  Controller,
  Get,
  Logger,
  NotFoundException,
  NotImplementedException,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/users/auth/auth.guard';
import { GetLandDTO } from 'src/land/get/get-land.dto';
import {
  NavigateToLandDTO,
  NavigateToLandQueryDTO,
} from 'src/land/in-game/navigate/navigate-to-land.dto';
import { ResumeLandNavigationDTO } from './in-game/resume/resume-land-navigation.dto';
import { AuthContext } from 'src/users/auth/auth-context';
import {
  WithAuthContext,
  WithOptionalAuthContext,
} from 'src/users/auth/auth-context.decorator';
import { PublicRoute } from 'src/users/auth/public-route.decorator';
import { DoorBlockRepository } from 'src/blocks/door-block.repository';
import { NavigationStateRepository } from 'src/navigation/state/navigation-state.repository';
import { DataSource } from 'typeorm';
import { LandsInGameService } from './lands-in-game.service';

@UseGuards(AuthGuard)
@Controller('lands')
export class LandsInGameController {
  private logger = new Logger(LandsInGameController.name)
  constructor(
    private dataSource: DataSource,
    private landService: LandsInGameService,
  ) {}

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
    const doorBlocksRepository =
      this.dataSource.getCustomRepository(DoorBlockRepository);

    const doorBlock = await doorBlocksRepository.findOne({
      where: { id: query.doorBlockId },
    });

    if (!doorBlock) {
      throw new NotFoundException();
    }

    let res: GetLandDTO;

    if (doorBlock.inLand) {
      // player came back
      if (query.currentLandId == doorBlock.toLand.id) {
        res = await this.landService.toInGameLandDTO(doorBlock.inLand);
      }
      // player entered
      else if (query.currentLandId == doorBlock.inLand.id) {
        res = await this.landService.toInGameLandDTO(doorBlock.toLand);
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

        await navigationStateRepository.save(navState);
      })().catch((err: unknown) =>
        this.logger.error('navigate:save-state', err),
      );
    }

    return res;
  }

  @Put('/escape')
  async escape(
    @WithAuthContext() authContext: AuthContext,
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
      await navigationStatesRepository.save(navigationState);
    });
  }
}
