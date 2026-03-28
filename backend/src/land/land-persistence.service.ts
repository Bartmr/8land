import { Injectable } from '@nestjs/common';
import { CreateLandRequestDTO } from '@shared/src/land/create/create-land.dto';
import { UploadLandAssetsParameters } from '@shared/src/land/upload-assets/upload-land-assets.dto';
import { AuthContext } from 'src/users/auth/auth-context';
import { getSearchableString } from 'src/strings/get-searchable-string';
import { World } from 'src/worlds/worlds.entity';
import { Land } from './land.entity';
import { WorldRepository } from 'src/worlds/worlds.repository';
import { DataSource } from 'typeorm';
import { LandRepository } from './land.repository';
import sharp from 'sharp';
import { createTiledJSONSchema } from '@shared/src/land/upload-assets/upload-land-assets.schemas';
import {
  ContentType,
  StorageService,
} from 'src/storage/storage.service';
import { throwError } from 'src/throw-error';
import {
  EditLandBodyDTO,
  EditLandParametersDTO,
} from '@shared/src/land/edit/edit-land.dto';
import {
  LAND_MAP_SIZE_LIMIT,
  LAND_TILESET_SIZE_LIMIT,
} from '@shared/src/land/upload-assets/upload-land-assets.constants';
import { StaticBlockType } from '@shared/src/blocks/block.enums';
import { EnvironmentVariables } from 'src/environment/environment-variables';
import { z } from "zod"

function getLandStorageKeys(landId: string) {
  const tilesetStorageKey = `lands/${landId}/tileset.png`;
  const mapStorageKey = `lands/${landId}/map.json`;

  return {
    tilesetStorageKey,
    mapStorageKey,
  };
}

@Injectable()
export class LandPersistenceService {
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
        error:
          | 'name-already-taken'
          | 'lands-limit-exceeded'
          | 'cannot-create-more-lands-without-start-block';
      }
    | {
        error?: undefined;
        res: {
          id: string;
          name: string;
        };
      }
  > {
    return connection.transaction(async (e) => {
      const landRepo = e.getCustomRepository(LandRepository);
      const worldRepository = connection.getCustomRepository(WorldRepository);

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

      const landsTotal: number = await landRepo.selectAndCount(
        {
          alias: 'land',
        },
        (qb) => {
          let finalQb = qb;

          if (limitations.useWorld) {
            finalQb = finalQb
              .leftJoinAndSelect('land.world', 'world')
              .where('world.user = :userId', { userId: authContext.user.id });
          } else {
            finalQb = finalQb.where('land.world IS NULL');
          }

          return finalQb;
        },
      );

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
          world = await worldRepository.create(new World({
            user: Promise.resolve(authContext.user),
            lands: Promise.resolve([]),
          }));
        } else {
          if (!previousWorld.hasStartLand) {
            return { error: 'cannot-create-more-lands-without-start-block' };
          }
          world = previousWorld;
        }

        land = await landRepo.create(new Land({
          name: body.name,
          searchableName: getSearchableString(body.name),
          doorBlocks: Promise.resolve([]),
          doorBlocksReferencing: Promise.resolve([]),
          backgroundMusicUrl: null,
          hasAssets: null,
          territories: Promise.resolve([]),
          appBlocks: [],
          isStartingLand: null,
          isTrainStation: null,
          world,
        }));
      } else {
        land = await landRepo.create(new Land({
          name: body.name,
          searchableName: getSearchableString(body.name),
          doorBlocks: Promise.resolve([]),
          doorBlocksReferencing: Promise.resolve([]),
          backgroundMusicUrl: null,
          hasAssets: null,
          territories: Promise.resolve([]),
          appBlocks: [],
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
      const landRepo = e.getCustomRepository(LandRepository);
      const worldRepo = e.getCustomRepository(WorldRepository);

      const totalStartLands = await landRepo.count({
        where: { isStartingLand: true },
      });

      if (totalStartLands > EnvironmentVariables.START_LANDS_TOTAL_LIMIT) {
        return { status: 'start-lands-limit-exceeded' } as const;
      }

      const land = await landRepo.selectOne(
        {
          alias: 'land',
        },
        (qb) => {
          let finalQb = qb
            .leftJoinAndSelect('land.world', 'world')
            .where('land.id = :id', { id: params.landId });

          if (authContext.user.isAdmin) {
            finalQb = finalQb.andWhere('land.world IS NULL');
          } else {
            finalQb = finalQb.andWhere('world.user = :userId', {
              userId: authContext.user.id,
            });
          }

          return finalQb;
        },
      );

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
      const landRepository = e.getCustomRepository(LandRepository);

      const land = await landRepository.selectOne(
        {
          alias: 'land',
        },
        (qb) => {
          let finalQb = qb
            .leftJoinAndSelect('land.world', 'world')
            .where('land.id = :id', { id: param.landId });

          if (authContext.user.isAdmin) {
            finalQb = finalQb.andWhere('land.world IS NULL');
          } else {
            finalQb = finalQb.andWhere('world.user = :userId', {
              userId: authContext.user.id,
            });
          }

          return finalQb;
        },
      );

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
      const landRepository = e.getCustomRepository(LandRepository);

      const land = await landRepository.selectOne(
        {
          alias: 'land',
        },
        (qb) => {
          let finalQb = qb
            .leftJoinAndSelect('land.world', 'world')
            .where('land.id = :id', { id: landId });

          if (!authContext.user.isAdmin) {
            finalQb = finalQb.andWhere('world.user = :userId', {
              userId: authContext.user.id,
            });
          }

          return finalQb;
        },
      );

      if (!land) {
        return { status: 'not-found' } as const;
      }

      const doorBlocks = await land.doorBlocks;
      const doorBlocksReferencing = await land.doorBlocksReferencing;

      if (
        land.appBlocks.length !== 0 ||
        doorBlocks.length !== 0 ||
        doorBlocksReferencing.length !== 0
      ) {
        return { status: 'must-delete-blocks-first' } as const;
      }

      if (land.isStartingLand) {
        return { status: 'cannot-delete-start-land' } as const;
      }

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
}
