import { DoorBlockRepository } from 'src/blocks/door-block.repository';
import { DoorBlock } from 'src/blocks/door-block.entity';
import { AppBlock } from 'src/blocks/app-block.entity';
import { getSearchableString } from 'src/strings/get-searchable-string';
import { Land } from 'src/land/land.entity';
import { LandRepository } from 'src/land/land.repository';
import { User } from 'src/users/user.entity';
import { World } from 'src/worlds/worlds.entity';
import { WorldRepository } from 'src/worlds/worlds.repository';
import { EntityManager } from 'typeorm';
import path from 'path';
import fs from 'fs';
import { AppBlockRepository } from 'src/blocks/app-block.repository';
import { promisify } from 'util';
import { createTiledJSONSchema } from 'src/land/upload-assets/upload-land-assets.schemas';
import { StaticBlockType } from 'src/blocks/block.enums';
import { DevStorageService } from 'src/storage/dev-storage.service';

const readFile = promisify(fs.readFile);

export async function seedUserLand({
  eM,
  storageService,
  user,
  appBlocksRepository,
}: {
  eM: EntityManager;
  storageService: DevStorageService;
  user: User;
  appBlocksRepository: AppBlockRepository;
}) {
  const worldsRepository = eM.getCustomRepository(WorldRepository);
  const landsRepository = eM.getCustomRepository(LandRepository);
  const doorBlocksRepository = eM.getCustomRepository(DoorBlockRepository);

  const worldEntity = new World({
    user: Promise.resolve(user),
    lands: Promise.resolve([]),
  });
  worldEntity.hasStartLand = true;
  const world = await worldsRepository.create(worldEntity);

  const townOfHumbleBeginnings = await landsRepository.create(
    new Land({
      name: 'USER LAND - Town of Humble Beginnings',
      searchableName: getSearchableString(
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
    }),
  );

  const townOfHumbleBeginningsUnderground1 = await landsRepository.create(
    new Land({
      name: 'USER LAND - Town of Humble Beginnings - Underground 1',
      searchableName: getSearchableString(
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
    }),
  );

  const townOfHumbleBeginningsUnderground2 = await landsRepository.create(
    new Land({
      name: 'USER LAND - Town of Humble Beginnings - Underground 2',
      searchableName: getSearchableString(
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
    }),
  );

  /* ----- */
  const townOfHumbleBeginningsDoor1 = await doorBlocksRepository.create(
    new DoorBlock({
      inTerritory: Promise.resolve(null),
      inLand: townOfHumbleBeginnings,
      toLand: townOfHumbleBeginningsUnderground1,
    }),
  );

  const townOfHumbleBeginningsDoor2 = await doorBlocksRepository.create(
    new DoorBlock({
      inTerritory: Promise.resolve(null),
      inLand: townOfHumbleBeginnings,
      toLand: townOfHumbleBeginningsUnderground2,
    }),
  );

  const townOfHumbleBeginningsApp1 = await appBlocksRepository.create(
    new AppBlock({
      inTerritory: Promise.resolve(null),
      inLand: Promise.resolve(townOfHumbleBeginnings),
      url: 'http://localhost:8000/apps/test',
    }),
  );

  const townOfHumbleBeginningsMapString = await readFile(
    path.resolve(
      process.cwd(),
      'development/seed/land/assets/town-of-humble-beginnings-map.json',
    ),
    { encoding: 'utf-8' },
  );
  const townOfHumbleBeginningsTileset = await readFile(
    path.resolve(
      process.cwd(),
      'development/seed/land/assets/town-of-humble-beginnings-tileset.png',
    ),
  );

  const townOfHumbleBeginningsMap = createTiledJSONSchema({
    maxWidth: null,
    maxHeight: null,
  }).parse(JSON.parse(townOfHumbleBeginningsMapString) as unknown);

 

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  townOfHumbleBeginningsMap.tilesets[0]!.tiles =
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    townOfHumbleBeginningsMap.tilesets[0]!.tiles.map((tile) => {
      return {
        ...tile,
        properties: tile.properties?.map((prop) => {
          if (prop.name === 'underground-entrance') {
            return {
              name: "underground-entrance",
              type: "string",
              value: `door:${townOfHumbleBeginningsDoor1.id}`,
            };
          } else if (prop.name === 'form') {
            return {
              name: "form",
              type: "string",
              value: `app:${townOfHumbleBeginningsApp1.id}`,
            };
          } else if (prop.name === 'underground') {
            return {
              name: "underground",
              type: "string",
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
      new DoorBlock({
        inTerritory: Promise.resolve(null),
        inLand: townOfHumbleBeginningsUnderground1,
        toLand: townOfHumbleBeginningsUnderground2,
      }),
    );

  const townOfHumbleBeginningsUnderground1MapString = await readFile(
    path.resolve(
      process.cwd(),
      'development/seed/land/assets/town-of-humble-beginnings-underground-1-map.json',
    ),
    { encoding: 'utf-8' },
  );
  const townOfHumbleBeginningsUnderground1Tileset = await readFile(
    path.resolve(
      process.cwd(),
      'development/seed/land/assets/town-of-humble-beginnings-underground-1-tileset.png',
    ),
  );

  const townOfHumbleBeginningsUnderground1Map = createTiledJSONSchema({
    maxWidth: null,
    maxHeight: null,
  }).parse(
    JSON.parse(townOfHumbleBeginningsUnderground1MapString) as unknown,
  );

 

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  townOfHumbleBeginningsUnderground1Map.tilesets[0]!.tiles =
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    townOfHumbleBeginningsUnderground1Map.tilesets[0]!.tiles.map((tile) => {
      return {
        ...tile,
        properties: tile.properties?.map((prop) => {
          if (prop.name === 'underground') {
            return {
              name: "underground",
              type: "string",
              value: `door:${townOfHumbleBeginningsUnderground1Door1.id}`,
            };
          } else if (prop.name === 'town') {
            return {
              name: "town",
              type: "string",
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
    JSON.stringify(townOfHumbleBeginningsUnderground1Map),
  );
  await storageService.saveBuffer(
    `lands/${townOfHumbleBeginningsUnderground1.id}/tileset.png`,
    townOfHumbleBeginningsUnderground1Tileset,
  );

  /* ----- */

  const townOfHumbleBeginningsUnderground2MapString = await readFile(
    path.resolve(
      process.cwd(),
      'development/seed/land/assets/town-of-humble-beginnings-underground-2-map.json',
    ),
    { encoding: 'utf-8' },
  );
  const townOfHumbleBeginningsUnderground2Tileset = await readFile(
    path.resolve(
      process.cwd(),
      'development/seed/land/assets/town-of-humble-beginnings-underground-2-tileset.png',
    ),
  );

  const townOfHumbleBeginningsUnderground2Map = createTiledJSONSchema({
    maxWidth: null,
    maxHeight: null,
  }).parse(
    JSON.parse(townOfHumbleBeginningsUnderground2MapString) as unknown,
  );

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  townOfHumbleBeginningsUnderground2Map.tilesets[0]!.tiles =
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    townOfHumbleBeginningsUnderground2Map.tilesets[0]!.tiles.map((tile) => {
      return {
        ...tile,
        properties: tile.properties?.map((prop) => {
          if (prop.name === 'town') {
            return {
              name: "town",
              type: "string",
              value: `door:${townOfHumbleBeginningsDoor2.id}`,
            };
          } else if (prop.name === 'entrance') {
            return {
              name: "entrance",
              type: "string",
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
