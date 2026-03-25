import { DoorBlockRepository } from 'src/blocks/typeorm/door-block.repository';
import { AuditContext } from 'src/internals/auditing/audit-context';
import { getSearchableName } from 'src/internals/utils/get-searchable-name';
import { LandRepository } from 'src/land/typeorm/land.repository';
import { User } from 'src/users/typeorm/user.entity';
import { WorldRepository } from 'src/worlds/worlds.repository';
import { EntityManager } from 'typeorm';
import path from 'path';
import fs from 'fs';
import { AppBlockRepository } from 'src/blocks/typeorm/app-block.repository';
import { promisify } from 'util';
import { createTiledJSONSchema } from 'libs/shared/src/land/upload-assets/upload-land-assets.schemas';
import { StaticBlockType } from 'libs/shared/src/blocks/block.enums';
import { DevStorageService } from 'src/internals/storage/dev-storage.service';

const readFile = promisify(fs.readFile);

export async function seedUserLand({
  eM,
  auditContext,
  storageService,
  user,
  appBlocksRepository,
}: {
  eM: EntityManager;
  auditContext: AuditContext;
  storageService: DevStorageService;
  user: User;
  appBlocksRepository: AppBlockRepository;
}) {
  const worldsRepository = eM.getCustomRepository(WorldRepository);
  const landsRepository = eM.getCustomRepository(LandRepository);
  const doorBlocksRepository = eM.getCustomRepository(DoorBlockRepository);

  const world = await worldsRepository.create(
    {
      user: Promise.resolve(user),
      lands: Promise.resolve([]),
      hasStartLand: true,
    },
    auditContext,
  );

  const townOfHumbleBeginnings = await landsRepository.create(
    {
      name: 'USER LAND - Town of Humble Beginnings',
      searchableName: getSearchableName(
        'USER LAND - Town of Humble Beginnings',
      ),
      backgroundMusicUrl: 'https://api.soundcloud.com/tracks/566456658',
      doorBlocks: Promise.resolve([]),
      doorBlocksReferencing: Promise.resolve([]),
      appBlocks: [],
      hasAssets: true,
      territories: Promise.resolve([]),
      world,
      isStartingLand: true,
      isTrainStation: null,
    },
    auditContext,
  );

  const townOfHumbleBeginningsUnderground1 = await landsRepository.create(
    {
      name: 'USER LAND - Town of Humble Beginnings - Underground 1',
      searchableName: getSearchableName(
        'USER LAND - Town of Humble Beginnings - Underground 1',
      ),
      backgroundMusicUrl: null,
      doorBlocks: Promise.resolve([]),
      doorBlocksReferencing: Promise.resolve([]),
      appBlocks: [],
      hasAssets: true,
      territories: Promise.resolve([]),
      world,
      isStartingLand: null,
      isTrainStation: null,
    },
    auditContext,
  );

  const townOfHumbleBeginningsUnderground2 = await landsRepository.create(
    {
      name: 'USER LAND - Town of Humble Beginnings - Underground 2',
      searchableName: getSearchableName(
        'USER LAND - Town of Humble Beginnings - Underground 2',
      ),
      backgroundMusicUrl: null,
      doorBlocks: Promise.resolve([]),
      doorBlocksReferencing: Promise.resolve([]),
      appBlocks: [],
      hasAssets: true,
      territories: Promise.resolve([]),
      world,
      isStartingLand: null,
      isTrainStation: null,
    },
    auditContext,
  );

  /* ----- */
  const townOfHumbleBeginningsDoor1 = await doorBlocksRepository.create(
    {
      inTerritory: Promise.resolve(null),
      inLand: townOfHumbleBeginnings,
      toLand: townOfHumbleBeginningsUnderground1,
    },
    auditContext,
  );

  const townOfHumbleBeginningsDoor2 = await doorBlocksRepository.create(
    {
      inTerritory: Promise.resolve(null),
      inLand: townOfHumbleBeginnings,
      toLand: townOfHumbleBeginningsUnderground2,
    },
    auditContext,
  );

  const townOfHumbleBeginningsApp1 = await appBlocksRepository.create(
    {
      inTerritory: Promise.resolve(null),
      inLand: Promise.resolve(townOfHumbleBeginnings),
      url: 'http://localhost:8000/apps/test',
    },
    auditContext,
  );

  const townOfHumbleBeginningsMapString = await readFile(
    path.resolve(
      process.cwd(),
      'src/land/spec/assets/town-of-humble-beginnings-map.json',
    ),
    { encoding: 'utf-8' },
  );
  const townOfHumbleBeginningsTileset = await readFile(
    path.resolve(
      process.cwd(),
      'src/land/spec/assets/town-of-humble-beginnings-tileset.png',
    ),
  );

  const townOfHumbleBeginningsMapRes = createTiledJSONSchema({
    maxWidth: null,
    maxHeight: null,
  }).validate(JSON.parse(townOfHumbleBeginningsMapString) as unknown);

  if (townOfHumbleBeginningsMapRes.errors) {
    throw new Error(JSON.stringify(townOfHumbleBeginningsMapRes.messagesTree));
  }

  const townOfHumbleBeginningsMap = townOfHumbleBeginningsMapRes.value;

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  townOfHumbleBeginningsMap.tilesets[0]!.tiles =
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    townOfHumbleBeginningsMap.tilesets[0]!.tiles.map((tile) => {
      return {
        ...tile,
        properties: tile.properties?.map((prop) => {
          if (prop.name === 'underground-entrance') {
            return {
              ...prop,
              value: `door:${townOfHumbleBeginningsDoor1.id}`,
            };
          } else if (prop.name === 'form') {
            return {
              ...prop,
              value: `app:${townOfHumbleBeginningsApp1.id}`,
            };
          } else if (prop.name === 'underground') {
            return {
              ...prop,
              value: `door:${townOfHumbleBeginningsDoor2.id}`,
            };
          } else if (prop.name === 'beach') {
            return {
              type: 'bool',
              name: StaticBlockType.Start,
              value: true,
            };
          } else {
            return prop;
          }
        }),
      };
    });

  await storageService.saveText(
    `lands/${townOfHumbleBeginnings.id}/map.json`,
    JSON.stringify(townOfHumbleBeginningsMap),
  );
  await storageService.saveBuffer(
    `lands/${townOfHumbleBeginnings.id}/tileset.png`,
    townOfHumbleBeginningsTileset,
  );

  /* ----- */

  const townOfHumbleBeginningsUnderground1Door1 =
    await doorBlocksRepository.create(
      {
        inTerritory: Promise.resolve(null),
        inLand: townOfHumbleBeginningsUnderground1,
        toLand: townOfHumbleBeginningsUnderground2,
      },
      auditContext,
    );

  const townOfHumbleBeginningsUnderground1MapString = await readFile(
    path.resolve(
      process.cwd(),
      'src/land/spec/assets/town-of-humble-beginnings-underground-1-map.json',
    ),
    { encoding: 'utf-8' },
  );
  const townOfHumbleBeginningsUnderground1Tileset = await readFile(
    path.resolve(
      process.cwd(),
      'src/land/spec/assets/town-of-humble-beginnings-underground-1-tileset.png',
    ),
  );

  const townOfHumbleBeginningsUnderground1MapRes = createTiledJSONSchema({
    maxWidth: null,
    maxHeight: null,
  }).validate(
    JSON.parse(townOfHumbleBeginningsUnderground1MapString) as unknown,
  );

  if (townOfHumbleBeginningsUnderground1MapRes.errors) {
    throw new Error(
      JSON.stringify(townOfHumbleBeginningsUnderground1MapRes.messagesTree),
    );
  }

  const townOfHumbleBeginningsUnderground1Res =
    townOfHumbleBeginningsUnderground1MapRes.value;

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  townOfHumbleBeginningsUnderground1Res.tilesets[0]!.tiles =
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    townOfHumbleBeginningsUnderground1Res.tilesets[0]!.tiles.map((tile) => {
      return {
        ...tile,
        properties: tile.properties?.map((prop) => {
          if (prop.name === 'underground') {
            return {
              ...prop,
              value: `door:${townOfHumbleBeginningsUnderground1Door1.id}`,
            };
          } else if (prop.name === 'town') {
            return {
              ...prop,
              value: `door:${townOfHumbleBeginningsDoor1.id}`,
            };
          } else {
            return prop;
          }
        }),
      };
    });

  await storageService.saveText(
    `lands/${townOfHumbleBeginningsUnderground1.id}/map.json`,
    JSON.stringify(townOfHumbleBeginningsUnderground1Res),
  );
  await storageService.saveBuffer(
    `lands/${townOfHumbleBeginningsUnderground1.id}/tileset.png`,
    townOfHumbleBeginningsUnderground1Tileset,
  );

  /* ----- */

  const townOfHumbleBeginningsUnderground2MapString = await readFile(
    path.resolve(
      process.cwd(),
      'src/land/spec/assets/town-of-humble-beginnings-underground-2-map.json',
    ),
    { encoding: 'utf-8' },
  );
  const townOfHumbleBeginningsUnderground2Tileset = await readFile(
    path.resolve(
      process.cwd(),
      'src/land/spec/assets/town-of-humble-beginnings-underground-2-tileset.png',
    ),
  );

  const townOfHumbleBeginningsUnderground2MapRes = createTiledJSONSchema({
    maxWidth: null,
    maxHeight: null,
  }).validate(
    JSON.parse(townOfHumbleBeginningsUnderground2MapString) as unknown,
  );

  if (townOfHumbleBeginningsUnderground2MapRes.errors) {
    throw new Error(
      JSON.stringify(townOfHumbleBeginningsUnderground2MapRes.messagesTree),
    );
  }

  const townOfHumbleBeginningsUnderground2Map =
    townOfHumbleBeginningsUnderground2MapRes.value;

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  townOfHumbleBeginningsUnderground2Map.tilesets[0]!.tiles =
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    townOfHumbleBeginningsUnderground2Map.tilesets[0]!.tiles.map((tile) => {
      return {
        ...tile,
        properties: tile.properties?.map((prop) => {
          if (prop.name === 'town') {
            return {
              ...prop,
              value: `door:${townOfHumbleBeginningsDoor2.id}`,
            };
          } else if (prop.name === 'entrance') {
            return {
              ...prop,
              value: `door:${townOfHumbleBeginningsUnderground1Door1.id}`,
            };
          } else {
            return prop;
          }
        }),
      };
    });

  await storageService.saveText(
    `lands/${townOfHumbleBeginningsUnderground2.id}/map.json`,
    JSON.stringify(townOfHumbleBeginningsUnderground2Map),
  );
  await storageService.saveBuffer(
    `lands/${townOfHumbleBeginningsUnderground2.id}/tileset.png`,
    townOfHumbleBeginningsUnderground2Tileset,
  );

  /* --- */
}
