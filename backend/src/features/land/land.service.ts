import { Injectable, Logger, NotImplementedException } from '@nestjs/common';
import {
  CreateLandRequestDTO,
  UploadLandAssetsParameters,
  EditLandBodyDTO,
  EditLandParametersDTO,
  GetLandDTO,
  NavigateToLandDTO,
  ResumeLandNavigationDTO,
  createTiledJSONSchema,
  LAND_MAP_SIZE_LIMIT,
  LAND_TILESET_SIZE_LIMIT,
} from 'src/features/land/land.dtos';
import { AuthContext } from 'src/features/users/auth/auth.guard';
import { getSearchableString } from 'src/core/strings/get-searchable-string';
import { World } from 'src/features/worlds/worlds.entities';
import { Land } from './land.entities';
import { DataSource, EntityManager } from 'typeorm';
import sharp from 'sharp';
import {
  ContentType,
  StorageService,
} from 'src/core/storage/storage.service';
import { throwError } from 'src/core/throw-error';
import { EnvironmentVariables } from 'src/core/environment-variables/environment-variables';
import { z } from 'zod';
import { NavigationState } from 'src/features/navigation/navigation-state.entities';
import { StaticBlockType } from 'src/features/blocks/blocks.dtos';

function getLandStorageKeys(landId: string) {
  const tilesetStorageKey = `lands/${landId}/tileset.png`;
  const mapStorageKey = `lands/${landId}/map.json`;

  return {
    tilesetStorageKey,
    mapStorageKey,
  };
}

@Injectable()
export class LandService {
  private logger = new Logger(LandService.name)

  constructor(private storageService: StorageService) {

  }

  async toNavigateToLandDTO(land: Land): Promise<NavigateToLandDTO> {
    const [doorBlocksReferencing, doorBlocks, appBlocks] = await Promise.all([
      land.doorBlocksReferencing,
      land.doorBlocks,
      land.appBlocks
    ]);

   

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
      isStartLand: !!land.isStartingLand,
    };
  }

  async resume({
    eM,
    authContext,
  }: {
    eM: EntityManager;
    authContext: AuthContext | undefined;
  }): Promise<ResumeLandNavigationDTO> {
    const navigationStateRepository = eM.getRepository(NavigationState);

    let navState: NavigationState | null;

    if (authContext) {
      navState = await navigationStateRepository.findOne({
        where: { user: { id: authContext.user.id } },
      });

      if (!navState) {
        navState = new NavigationState({ user: Promise.resolve(authContext.user) });
        navState = await navigationStateRepository.save(navState);
      }
    } else {
      navState = null;
    }

    const lastCheckpointWasDeleted = !!navState?.lastCheckpointWasDeleted;

    if (navState) {
      (async () => {
        navState.lastCheckpointWasDeleted = false;

        await navigationStateRepository.save(navState);
      })().catch((err: unknown) =>
        this.logger.error('navigate:resume', err),
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
            const land = await this.toNavigateToLandDTO(navState.lastDoor.inLand);

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

          const land = await this.toNavigateToLandDTO(navState.lastDoor.toLand);

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
        const land = await this.toNavigateToLandDTO(navState.traveledByTrainToLand);

        return {
          ...land,
          lastDoor: null,
          lastTrainTravel: {
            comingBackToStation: false,
          },
          lastCheckpointWasDeleted,
        };
      } else if (navState.boardedOnTrainStation) {
        const land = await this.toNavigateToLandDTO(navState.boardedOnTrainStation);

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

    const firstLand = await eM.getRepository(Land)
      .createQueryBuilder('land')
      .leftJoinAndSelect('land.world', 'world')
      .where('land.hasAssets = :hasAssets', { hasAssets: true })
      .andWhere('land.world IS NULL')
      .orderBy('land.createdAt', 'ASC')
      .getOne();

    if (!firstLand) {
      throw new Error();
    }

    const land = await this.toNavigateToLandDTO(firstLand);

    return {
      ...land,
      lastDoor: null,
      lastCheckpointWasDeleted,
      lastTrainTravel: null,
    };
  }

  async createLand({
    connection,
    body,
    authContext,
    limitations,
  }: {
    connection: DataSource;
    authContext: AuthContext;
    body: CreateLandRequestDTO;
    limitations: {
      limitQuantity: number | undefined;
      useWorld: boolean;
    };
  }): Promise<
    | {
        error?:
          | 'name-already-taken'
          | 'lands-limit-exceeded'
          | 'cannot-create-more-lands-without-start-block';
        res?: {
          id: string;
          name: string;
        };
      }
  > {
    return connection.transaction(async (e) => {
      const landRepo = e.getRepository(Land);
      const worldRepository = e.getRepository(World);

      const landWithSameName = await landRepo.findOne({
        where: {
          searchableName: getSearchableString(body.name),
        },
      });

      if (landWithSameName) {
        return {
          error: 'name-already-taken',
        };
      }

      let landsQuery = landRepo.createQueryBuilder('land');

      if (limitations.useWorld) {
        landsQuery = landsQuery
          .leftJoinAndSelect('land.world', 'world')
          .where('world.user = :userId', { userId: authContext.user.id });
      } else {
        landsQuery = landsQuery.where('land.world IS NULL');
      }

      const landsTotal = await landsQuery.getCount();

      if (
        limitations.limitQuantity != null &&
        landsTotal > limitations.limitQuantity
      ) {
        return {
          error: 'lands-limit-exceeded',
        };
      }

      let land;

      if (limitations.useWorld) {
        let world: World;

        const previousWorld = await worldRepository.findOne({
          where: {
            user: authContext.user,
          },
        });

        if (!previousWorld) {
          world = await worldRepository.save(new World({
            user: Promise.resolve(authContext.user),
            lands: Promise.resolve([]),
          }));
        } else {
          if (!previousWorld.hasStartLand) {
            return { error: 'cannot-create-more-lands-without-start-block' };
          }
          world = previousWorld;
        }

        land = await landRepo.save(new Land({
          name: body.name,
          searchableName: getSearchableString(body.name),
          doorBlocks: Promise.resolve([]),
          doorBlocksReferencing: Promise.resolve([]),
          backgroundMusicUrl: null,
          hasAssets: null,
          appBlocks: Promise.resolve([]),
          isStartingLand: null,
          isTrainStation: null,
          world,
        }));
      } else {
        land = await landRepo.save(new Land({
          name: body.name,
          searchableName: getSearchableString(body.name),
          doorBlocks: Promise.resolve([]),
          doorBlocksReferencing: Promise.resolve([]),
          backgroundMusicUrl: null,
          hasAssets: null,
          appBlocks: Promise.resolve([]),
          isStartingLand: null,
          isTrainStation: null,
          world: null,
        }));
      }

      return {
        res: {
          id: land.id,
          name: land.name,
        },
      };
    });
  }

  async uploadLandAssets({
    connection,
    storageService,
    params,
    map,
    tileset,
    authContext,
  }: {
    connection: DataSource;
    storageService: StorageService;
    params: UploadLandAssetsParameters;
    map: Express.Multer.File;
    tileset: Express.Multer.File;
    authContext: AuthContext;
  }) {

    return connection.transaction(async (e) => {
      const landRepo = e.getRepository(Land);
      const worldRepo = e.getRepository(World);

      const totalStartLands = await landRepo.count({
        where: { isStartingLand: true },
      });

      if (totalStartLands > EnvironmentVariables.START_LANDS_TOTAL_LIMIT) {
        return { status: 'start-lands-limit-exceeded' } as const;
      }

      let landQuery = landRepo
        .createQueryBuilder('land')
        .leftJoinAndSelect('land.world', 'world')
        .where('land.id = :id', { id: params.landId });

      if (authContext.user.isAdmin) {
        landQuery = landQuery.andWhere('land.world IS NULL');
      } else {
        landQuery = landQuery.andWhere('world.user = :userId', {
          userId: authContext.user.id,
        });
      }

      const land = await landQuery.getOne();

      if (!land) {
        return { status: 'not-found' } as const;
      }

      if (map.size > LAND_MAP_SIZE_LIMIT) {
        return { status: 'map-exceeds-file-size-limit' } as const;
      }

      if (tileset.size > LAND_TILESET_SIZE_LIMIT) {
        return {
          status: 'tileset-exceeds-file-size-limit',
        } as const;
      }

      let tilesetMedatada: sharp.Metadata;

      try {
        const sharpImg = sharp(tileset.buffer);

        tilesetMedatada = await sharpImg.metadata();

        await sharpImg.stats();
      } catch (err) {
        return { status: 'unrecognized-tileset-format' } as const;
      }

      if (tilesetMedatada.format !== 'png') {
        return { status: 'unrecognized-tileset-format' } as const;
      }

      let mapJSON;

      try {
        const string = map.buffer.toString();

        mapJSON = JSON.parse(string) as unknown;
      } catch (err) {
        return { status: 'unparsable-map-json' } as const;
      }

      const TiledJSONSchema = createTiledJSONSchema({
        maxWidth: null,
        maxHeight: null,
      });

      const tiledJSONValidationResult = TiledJSONSchema.safeParse(mapJSON);

      if (!tiledJSONValidationResult.success) {
        return {
          status: 'tiled-json-validation-error',
          messageTree: tiledJSONValidationResult.error,
        } as const;
      }

      const tilesetSpecifications =
        tiledJSONValidationResult.data.tilesets[0] || throwError();

      if (
        tilesetMedatada.width !== tilesetSpecifications.imagewidth ||
        tilesetMedatada.height !== tilesetSpecifications.imageheight
      ) {
        return {
          status: 'tileset-dimensions-dont-match',
        } as const;
      }

      //
      const hasTrainBlock = tilesetSpecifications.tiles.some((tile) => {
        const tileHasTrainBlock = tile.properties?.some((tileProp) => {
          return tileProp.name === StaticBlockType.TrainPlatform;
        });

        return tileHasTrainBlock;
      });

      if (land.world) {
        if (hasTrainBlock) {
          return {
            status: 'cannot-have-train-block-in-world-lands',
          } as const;
        }

        const hasStartBlock = tilesetSpecifications.tiles.some((tile) => {
          const tileHasStartBlock = tile.properties?.some((tileProp) => {
            return tileProp.name === StaticBlockType.Start;
          });

          return tileHasStartBlock;
        });

        if (land.world.hasStartLand && hasStartBlock && !land.isStartingLand) {
          return {
            status: 'only-one-land-can-have-a-start-block',
          } as const;
        } else if (land.isStartingLand && !hasStartBlock) {
          return { status: 'cannot-remove-start-block' } as const;
        } else if (!land.world.hasStartLand && !hasStartBlock) {
          return {
            status: 'must-have-start-block-in-first-land',
          } as const;
        }

        if (hasStartBlock) {
          land.isStartingLand = true;
          land.world.hasStartLand = true;
        }
      } else {
        const hasStartBlock = tilesetSpecifications.tiles.some((tile) => {
          const tileHasStartBlock = tile.properties?.some((tileProp) => {
            return tileProp.name === StaticBlockType.Start;
          });

          return tileHasStartBlock;
        });

        if (hasStartBlock) {
          return {
            status: 'cannot-have-start-block-in-admin-lands',
          } as const;
        }

        land.isTrainStation = hasTrainBlock;
      }

      //

      const { tilesetStorageKey, mapStorageKey } = getLandStorageKeys(
        params.landId,
      );

      await storageService.saveBuffer(tilesetStorageKey, tileset.buffer, {
        contentType: ContentType.PNG,
      });

      const toSave: z.infer<typeof TiledJSONSchema> = {
        ...tiledJSONValidationResult.data,
        tilesets: [
          {
            ...(tiledJSONValidationResult.data.tilesets[0] || throwError()),
            image: 'tileset.png',
          },
        ],
      };

      await storageService.saveText(mapStorageKey, JSON.stringify(toSave), {
        contentType: ContentType.JSON,
      });

      if (!land.hasAssets) {
        land.hasAssets = true;
      }
      land.updatedAt = new Date();

      await landRepo.save(land);
      if (land.world) {
        await worldRepo.save(land.world);
      }

      return { status: 'ok' } as const;
    });
  }

  // TODO Create endpoint to see how many lands with assets are left to create before reaching limit

  editLand({
    connection,
    body,
    param,
    authContext,
  }: {
    connection: DataSource;
    body: EditLandBodyDTO;
    param: EditLandParametersDTO;
    authContext: AuthContext;
  }) {
    return connection.transaction(async (e) => {
      const landRepository = e.getRepository(Land);

      let landQuery = landRepository
        .createQueryBuilder('land')
        .leftJoinAndSelect('land.world', 'world')
        .where('land.id = :id', { id: param.landId });

      if (authContext.user.isAdmin) {
        landQuery = landQuery.andWhere('land.world IS NULL');
      } else {
        landQuery = landQuery.andWhere('world.user = :userId', {
          userId: authContext.user.id,
        });
      }

      const land = await landQuery.getOne();

      if (!land) {
        return { status: 'not-found' } as const;
      }

      if (body.name && body.name !== land.name) {
        const searchableName = getSearchableString(body.name);

        const landWithSameName = await landRepository.findOne({
          where: {
            searchableName,
          },
        });

        if (landWithSameName) {
          return { status: 'name-already-taken' } as const;
        }

        land.name = body.name;
        land.searchableName = searchableName;
      }

      if (
        typeof body.backgroundMusicUrl !== 'undefined' &&
        body.backgroundMusicUrl != land.backgroundMusicUrl
      ) {
        land.backgroundMusicUrl = body.backgroundMusicUrl;
      }

      await landRepository.save(land);

      return {
        status: 'ok',
        data: {
          id: land.id,
          name: land.name,
        },
      } as const;
    });
  }

  async deleteLand({
    connection,
    landId,
    storageService,
    authContext,
  }: {
    connection: DataSource;
    landId: string;
    storageService: StorageService;
    authContext: AuthContext;
  }) {
    const res = await connection.transaction(async (e) => {
      const landRepository = e.getRepository(Land);

      let landQuery = landRepository
        .createQueryBuilder('land')
        .leftJoinAndSelect('land.world', 'world')
        .where('land.id = :id', { id: landId });

      if (!authContext.user.isAdmin) {
        landQuery = landQuery.andWhere('world.user = :userId', {
          userId: authContext.user.id,
        });
      }

      const land = await landQuery.getOne();

      if (!land) {
        return { status: 'not-found' } as const;
      }

      const doorBlocks = await land.doorBlocks;
      const doorBlocksReferencing = await land.doorBlocksReferencing;
      const appBlocks = await land.appBlocks

      if (
        doorBlocks.length !== 0 ||
        doorBlocksReferencing.length !== 0 ||
        appBlocks.length !== 0
      ) {
        return { status: 'must-delete-blocks-first' } as const;
      }

      if (land.isStartingLand) {
        return { status: 'cannot-delete-start-land' } as const;
      }

      // Inline LandRepository.remove logic: update NavigationState
      const navigationStateRepository = e.getRepository(NavigationState);
      await navigationStateRepository
        .createQueryBuilder()
        .update()
        .set({
          traveledByTrainToLand: null,
          lastCheckpointWasDeleted: true,
        })
        .where('traveledByTrainToLand = :traveledByTrainToLandId', {
          traveledByTrainToLandId: land.id,
        })
        .execute();

      await navigationStateRepository
        .createQueryBuilder()
        .update()
        .set({
          traveledByTrainToLand: null,
          boardedOnTrainStation: null,
          lastCheckpointWasDeleted: true,
        })
        .where('boardedOnTrainStation = :boardedOnTrainStationId', {
          boardedOnTrainStationId: land.id,
        })
        .execute();

      await landRepository.remove(land);

      return { status: 'ok' } as const;
    });

    if (res.status === 'ok') {
      const { tilesetStorageKey, mapStorageKey } = getLandStorageKeys(landId);

      await storageService.removeFile(mapStorageKey);
      await storageService.removeFile(tilesetStorageKey);

      return res;
    } else {
      return res;
    }
  }

  async toGetLandDTO(land: Land): Promise<GetLandDTO> {
      const [doorBlocksReferencing, doorBlocks, appBlocks] = await Promise.all([
        land.doorBlocksReferencing,
        land.doorBlocks,
        land.appBlocks
      ]);
  
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
        isStartLand: !!land.isStartingLand,
      };
    }
}
