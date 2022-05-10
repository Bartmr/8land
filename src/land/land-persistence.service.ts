import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { CreateLandRequestDTO } from 'libs/shared/src/land/create/create-land.dto';
import { UploadLandAssetsParameters } from 'libs/shared/src/land/upload-assets/upload-land-assets.dto';
import { AuthContext } from 'src/auth/auth-context';
import { AuditContext } from 'src/internals/auditing/audit-context';
import { getSearchableName } from 'src/internals/utils/get-searchable-name';
import { World } from 'src/worlds/typeorm/worlds.entity';
import { WorldRepository } from 'src/worlds/worlds.repository';
import { Connection } from 'typeorm';
import { LandRepository } from './typeorm/land.repository';
import sharp from 'sharp';
import { createTiledJSONSchema } from 'libs/shared/src/land/upload-assets/upload-land-assets.schemas';
import { ResourceNotFoundException } from 'src/internals/server/resource-not-found.exception';
import {
  ContentType,
  StorageService,
} from 'src/internals/storage/storage.service';
import { InferType } from 'not-me/lib/schemas/schema';
import { throwError } from 'src/internals/utils/throw-error';
import {
  EditLandBodyDTO,
  EditLandParametersDTO,
} from 'libs/shared/src/land/edit/edit-land.dto';

@Injectable()
export class LandPersistenceService {
  async createLand({
    connection,
    body,
    auditContext,
    authContext,
    limitations,
  }: {
    connection: Connection;
    auditContext: AuditContext;
    authContext: AuthContext;
    body: CreateLandRequestDTO;
    limitations: {
      limitQuantity: number | undefined;
      useWorld: boolean;
    };
  }): Promise<
    | {
        error: 'name-already-taken' | 'lands-limit-exceeded';
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
          searchableName: getSearchableName(body.name),
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
              .where('world.user = :id', { id: authContext.user.id });
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

      const landBaseProps = {
        name: body.name,
        searchableName: getSearchableName(body.name),
        doorBlocks: Promise.resolve([]),
        doorBlocksReferencing: Promise.resolve([]),
        backgroundMusicUrl: null,
        hasAssets: null,
        territories: Promise.resolve([]),
        appBlocks: [],
        isStartingLand: null,
      };

      let land;

      if (limitations.useWorld) {
        let world: World;

        const previousWorld = await worldRepository.findOne({
          where: {
            user: authContext.user,
          },
        });

        if (!previousWorld) {
          world = await worldRepository.create(
            {
              user: Promise.resolve(authContext.user),
              lands: Promise.resolve([]),
            },
            auditContext,
          );
        } else {
          world = previousWorld;
        }

        land = await landRepo.create(
          {
            ...landBaseProps,
            world: Promise.resolve(world),
          },
          auditContext,
        );
      } else {
        land = await landRepo.create(
          {
            ...landBaseProps,
            world: Promise.resolve(null),
          },
          auditContext,
        );
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
    auditContext,
    params,
    map,
    tileset,
  }: {
    connection: Connection;
    storageService: StorageService;
    auditContext: AuditContext;
    params: UploadLandAssetsParameters;
    map: Express.Multer.File;
    tileset: Express.Multer.File;

    limitations: {
      allowTrainBlock: boolean;
      allowStartBlock: boolean;
    };
  }) {
    if (map.size > 128000) {
      throw new BadRequestException({ error: 'map-exceeds-file-size-limit' });
    }

    if (tileset.size > 64000) {
      throw new BadRequestException({
        error: 'tileset-exceeds-file-size-limit',
      });
    }

    let tilesetMedatada: sharp.Metadata;

    try {
      const sharpImg = sharp(tileset.buffer);

      tilesetMedatada = await sharpImg.metadata();

      await sharpImg.stats();
    } catch (err) {
      throw new BadRequestException({ error: 'unrecognized-tileset-format' });
    }

    if (tilesetMedatada.format !== 'png') {
      throw new BadRequestException({ error: 'unrecognized-tileset-format' });
    }

    let mapJSON;

    try {
      const string = map.buffer.toString();

      mapJSON = JSON.parse(string) as unknown;
    } catch (err) {
      throw new BadRequestException({ error: 'unparsable-map-json' });
    }

    const TiledJSONSchema = createTiledJSONSchema({
      maxWidth: null,
      maxHeight: null,
    });

    const tiledJSONValidationResult = TiledJSONSchema.validate(mapJSON);

    if (tiledJSONValidationResult.errors) {
      throw new BadRequestException({
        error: 'tiled-json-validation-error',
        messageTree: tiledJSONValidationResult.messagesTree,
      });
    }

    const tilesetSpecifications =
      tiledJSONValidationResult.value.tilesets[0] || throwError();

    if (
      tilesetMedatada.width !== tilesetSpecifications.imagewidth ||
      tilesetMedatada.height !== tilesetSpecifications.imageheight
    ) {
      throw new BadRequestException({
        error: 'tileset-dimensions-dont-match',
      });
    }

    const tilesetStorageKey = `lands/${params.landId}/tileset.png`;
    const mapStorageKey = `lands/${params.landId}/map.json`;

    await connection.transaction(async (e) => {
      const landRepo = e.getCustomRepository(LandRepository);

      const land = await landRepo.findOne({
        where: {
          id: params.landId,
        },
      });

      if (!land) {
        throw new ResourceNotFoundException();
      }

      await storageService.saveBuffer(tilesetStorageKey, tileset.buffer, {
        contentType: ContentType.PNG,
      });

      const toSave: InferType<typeof TiledJSONSchema> = {
        ...tiledJSONValidationResult.value,
        tilesets: [
          {
            ...(tiledJSONValidationResult.value.tilesets[0] || throwError()),
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

      await landRepo.save(land, auditContext);
    });
  }

  editLand({
    connection,
    auditContext,
    body,
    param,
  }: {
    connection: Connection;
    auditContext: AuditContext;
    body: EditLandBodyDTO;
    param: EditLandParametersDTO;
    limitations: {};
  }) {
    return connection.transaction(async (e) => {
      const landRepository = e.getCustomRepository(LandRepository);

      const land = await landRepository.findOne({
        where: {
          id: param.landId,
        },
      });

      if (!land) {
        throw new ResourceNotFoundException();
      }

      if (body.name && body.name !== land.name) {
        const searchableName = getSearchableName(body.name);

        const landWithSameName = await landRepository.findOne({
          where: {
            searchableName,
          },
        });

        if (landWithSameName) {
          throw new ConflictException({ error: 'name-already-taken' });
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

      await landRepository.save(land, auditContext);

      return {
        id: land.id,
        name: land.name,
      };
    });
  }

  deleteLand({
    connection,
    landId,
  }: {
    connection: Connection;
    landId: string;
  }) {
    return connection.transaction(async (e) => {
      const landRepository = e.getCustomRepository(LandRepository);

      const land = await landRepository.findOne({
        where: {
          id: landId,
        },
      });

      if (!land) {
        throw new ResourceNotFoundException();
      }

      const doorBlocks = await land.doorBlocks;
      const doorBlocksReferencing = await land.doorBlocksReferencing;

      if (
        land.appBlocks.length !== 0 ||
        doorBlocks.length !== 0 ||
        doorBlocksReferencing.length !== 0
      ) {
        return { result: 'must-delete-blocks-first' } as const;
      }

      await landRepository.remove(land);

      return { result: 'ok' };
    });
  }
}
