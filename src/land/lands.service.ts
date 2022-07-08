import { NotImplementedException } from '@nestjs/common';
import { GetLandDTO } from 'libs/shared/src/land/get/get-land.dto';
import { AuthContext } from 'src/auth/auth-context';
import { AuditContext } from 'src/internals/auditing/audit-context';
import { InjectTypeormConnection } from 'src/internals/databases/inject-typeorm-connection.decorator';
import { LoggingService } from 'src/internals/logging/logging.service';
import { StorageService } from 'src/internals/storage/storage.service';
import { throwError } from 'src/internals/utils/throw-error';
import { NavigationState } from 'src/users/typeorm/navigation-state.entity';
import { NavigationStateRepository } from 'src/users/typeorm/navigation-state.repository';
import { Connection, EntityManager } from 'typeorm';
import { Land } from './typeorm/land.entity';
import { LandRepository } from './typeorm/land.repository';

export class LandsService {
  constructor(
    @InjectTypeormConnection() private connection: Connection,
    private storageService: StorageService,
  ) {}

  async mapLand(land: Land): Promise<GetLandDTO> {
    const [territories, doorBlocksReferencing, doorBlocks] = await Promise.all([
      land.territories,
      land.doorBlocksReferencing,
      land.doorBlocks,
    ]);

    const appBlocks = land.appBlocks;

    return {
      id: land.id,
      name: land.name,
      backgroundMusicUrl: land.backgroundMusicUrl,
      assets: land.hasAssets
        ? {
            baseUrl: this.storageService.getHostUrl(),
            mapKey: `lands/${land.id}/map.json`,
            tilesetKey: `lands/${land.id}/tileset.png`,
          }
        : undefined,
      doorBlocksReferencing: doorBlocksReferencing.map((b) => {
        if (!b.inLand) throwError();

        return {
          id: b.id,
          fromLandId: b.inLand.id,
          fromLandName: b.inLand.name,
        };
      }),
      doorBlocks: doorBlocks.map((b) => {
        return {
          id: b.id,
          toLand: {
            id: b.toLand.id,
            name: b.toLand.name,
          },
        };
      }),
      appBlocks: appBlocks.map((b) => ({
        id: b.id,
        url: b.url,
      })),
      territories: territories.map((territory) => {
        return {
          id: territory.id,
          startX: territory.startX,
          startY: territory.startY,
          endX: territory.endX,
          endY: territory.endY,
          assets: territory.hasAssets
            ? {
                baseUrl: this.storageService.getHostUrl(),
                mapKey: `territories/${territory.id}/map.json`,
                tilesetKey: `territories/${territory.id}/tileset.png`,
              }
            : undefined,
          doorBlocks: territory.doorBlocks.map((b) => {
            return {
              id: b.id,
              toLand: {
                id: b.toLand.id,
                name: b.toLand.name,
              },
            };
          }),
          appBlocks: territory.appBlocks.map((b) => ({
            id: b.id,
            url: b.url,
          })),
        };
      }),
      isStartLand: !!land.isStartingLand,
    };
  }

  async resume({
    eM,
    loggingService,
    auditContext,
    authContext,
  }: {
    eM: EntityManager;
    loggingService: LoggingService;
    authContext: AuthContext | undefined;
    auditContext: AuditContext;
  }) {
    const navigationStateRepository = eM.getCustomRepository(
      NavigationStateRepository,
    );

    let navState: NavigationState | undefined;

    if (authContext) {
      navState = await navigationStateRepository.getNavigationStateFromUser(
        authContext.user,
        { auditContext },
      );
    }

    const lastCheckpointWasDeleted = !!navState?.lastCheckpointWasDeleted;

    if (navState) {
      (async () => {
        navState.lastCheckpointWasDeleted = false;

        await navigationStateRepository.save(navState, auditContext);
      })().catch((err: unknown) =>
        loggingService.logError('navigate:resume', err),
      );

      if (navState.lastDoor) {
        if (navState.cameBack) {
          if (navState.lastDoor.inLand) {
            if (
              navState.lastDoor.inLand.world &&
              !navState.lastDoor.inLand.world.hasStartLand
            ) {
              throw new Error(
                'Lands and worlds cannot loose their start block',
              );
            }
            const land = await this.mapLand(navState.lastDoor.inLand);

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
              lastCheckpointWasDeleted,
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

          const land = await this.mapLand(navState.lastDoor.toLand);

          return {
            ...land,
            backgroundMusicUrl:
              land.backgroundMusicUrl || navState.lastPlayedBackgroundMusicUrl,
            lastDoor: {
              id: navState.lastDoor.id,
              toLandId: navState.lastDoor.toLand.id,
            },
            lastTrainTravel: null,
            lastCheckpointWasDeleted,
          };
        }
      } else if (navState.traveledByTrainToLand) {
        const land = await this.mapLand(navState.traveledByTrainToLand);

        return {
          ...land,
          lastDoor: null,
          lastTrainTravel: {
            comingBackToStation: false,
          },
          lastCheckpointWasDeleted,
        };
      } else if (navState.boardedOnTrainStation) {
        const land = await this.mapLand(navState.boardedOnTrainStation);

        return {
          ...land,
          lastDoor: null,
          lastTrainTravel: {
            comingBackToStation: true,
          },
          lastCheckpointWasDeleted,
        };
      }
    }

    const landsRepository = eM.getCustomRepository(LandRepository);

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

    const land = await this.mapLand(firstLand);

    return {
      ...land,
      lastDoor: null,
      lastCheckpointWasDeleted,
      lastTrainTravel: null,
    };
  }
}
