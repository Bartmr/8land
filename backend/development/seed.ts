import dotenv from "dotenv"

dotenv.config()

import { createConnection } from 'typeorm';
import * as firebaseAdmin from 'firebase-admin';
import { UsersRepository } from 'src/users/users.repository';
import { throwError } from 'src/throw-error';
import { LandRepository } from 'src/land/land.repository';
import { TerritoriesRepository } from 'src/territories/territories.repository';
import { getSearchableString } from 'src/strings/get-searchable-string';
import { DoorBlockRepository } from 'src/blocks/door-block.repository';
import fs from 'fs';
import { promisify } from 'util';
import path from 'path';
import { DevStorageService } from 'src/storage/dev-storage.service';
import { LOCAL_TEMPORARY_FILES_PATH } from 'src/temporary-files/temporary-files';
import { AppBlockRepository } from 'src/blocks/app-block.repository';
import { createTiledJSONSchema } from 'src/land/upload-assets/upload-land-assets.schemas';
import { seedTrainStation } from './seed/seed-train-station';
import { seedUserLand } from './seed/seed-user-land';
import { EnvironmentVariables } from "src/environment/environment-variables";
import { v4 } from "uuid";
import { User } from "src/users/user.entity";
import { Land } from "src/land/land.entity";
import { DoorBlock } from "src/blocks/door-block.entity";
import { AppBlock } from "src/blocks/app-block.entity";
import { Territory } from "src/territories/territory.entity";
import { AppDataSourceOptions } from "src/database/data-source";

const readFile = promisify(fs.readFile);
const rm = promisify(fs.rm);


async function seed() {
  const FIREBASE_AUTH_EMULATOR_HOST =
    EnvironmentVariables.FIREBASE_AUTH_EMULATOR_HOST;

  if (!FIREBASE_AUTH_EMULATOR_HOST) {
    throw new Error('Must use Firebase Auth Emulator for seeding');
  }

  await rm(LOCAL_TEMPORARY_FILES_PATH, { recursive: true, force: true });

  const firebaseProjectId = EnvironmentVariables.FIREBASE_EMULATOR_PROJECT_ID || throwError();

  const firebaseApp = firebaseAdmin.initializeApp({
    projectId: firebaseProjectId,
  });
  const firebaseAuth = firebaseApp.auth();

  const res = await fetch(
    `http://${FIREBASE_AUTH_EMULATOR_HOST}/emulator/v1/projects/${firebaseProjectId}/accounts`,
    { method: 'DELETE' },
  );

  if (res.status !== 200) {
    throw new Error(`Failed to clear Firebase Auth emulator accounts: ${res.status}`);
  }

  const defaultDBConnection = await createConnection(AppDataSourceOptions);

  await defaultDBConnection.runMigrations();

  const usersRepository =
    defaultDBConnection.getCustomRepository(UsersRepository);

  const endUser = new User(
    {
      firebaseUid: (
        await firebaseAuth.createUser({
          email: 'end-user@8land.com',
          emailVerified: true,
          password: 'password123',
        })
      ).uid,
      isAdmin: false,
      appId: v4(),
    },
  )

  await usersRepository.create(
    endUser
  );

  const adminUser = new User(
    {
      firebaseUid: (
        await firebaseAuth.createUser({
          email: 'admin@8land.com',
          emailVerified: true,
          password: 'password123',
        })
      ).uid,
      isAdmin: true,
      appId: v4(),
    },
  )

  await usersRepository.create(
    adminUser
  );

  const landsRepository =
    defaultDBConnection.getCustomRepository(LandRepository);
  const doorBlocksRepository =
    defaultDBConnection.getCustomRepository(DoorBlockRepository);
  const appBlocksRepository =
    defaultDBConnection.getCustomRepository(AppBlockRepository);
  const storageService = new DevStorageService();

  const expectationsBeach = await landsRepository.create(
    new Land({
      name: 'Expectations Beach',
      searchableName: getSearchableString('Expectations Beach'),
      backgroundMusicUrl: 'https://api.soundcloud.com/tracks/256813580',
      doorBlocks: Promise.resolve([]),
      doorBlocksReferencing: Promise.resolve([]),
      appBlocks: [],
      hasAssets: true,
      territories: Promise.resolve([]),
      world: null,
      isStartingLand: null,
      isTrainStation: null,
    }),
  );

  const townOfHumbleBeginnings = await landsRepository.create(
    new Land({
      name: 'Town of Humble Beginnings',
      searchableName: getSearchableString('Town of Humble Beginnings'),
      backgroundMusicUrl: 'https://api.soundcloud.com/tracks/566456658',
      doorBlocks: Promise.resolve([]),
      doorBlocksReferencing: Promise.resolve([]),
      appBlocks: [],
      hasAssets: true,
      territories: Promise.resolve([]),
      world: null,
      isStartingLand: null,
      isTrainStation: null,
    }),
  );

  const townOfHumbleBeginningsUnderground1 = await landsRepository.create(
    new Land({
      name: 'Town of Humble Beginnings - Underground 1',
      searchableName: getSearchableString(
        'Town of Humble Beginnings - Underground 1',
      ),
      backgroundMusicUrl: null,
      doorBlocks: Promise.resolve([]),
      doorBlocksReferencing: Promise.resolve([]),
      appBlocks: [],
      hasAssets: true,
      territories: Promise.resolve([]),
      world: null,
      isStartingLand: null,
      isTrainStation: null,
    }),
  );

  const townOfHumbleBeginningsUnderground2 = await landsRepository.create(
    new Land({
      name: 'Town of Humble Beginnings - Underground 2',
      searchableName: getSearchableString(
        'Town of Humble Beginnings - Underground 2',
      ),
      backgroundMusicUrl: null,
      doorBlocks: Promise.resolve([]),
      doorBlocksReferencing: Promise.resolve([]),
      appBlocks: [],
      hasAssets: true,
      territories: Promise.resolve([]),
      world: null,
      isStartingLand: null,
      isTrainStation: null,
    }),
  );

  const townOfHumbleBeginningsTemple = await landsRepository.create(
    new Land({
      name: 'Town of Humble Beginnings - Temple',
      searchableName: getSearchableString('Town of Humble Beginnings - Temple'),
      backgroundMusicUrl: null,
      doorBlocks: Promise.resolve([]),
      doorBlocksReferencing: Promise.resolve([]),
      appBlocks: [],
      hasAssets: true,
      territories: Promise.resolve([]),
      world: null,
      isStartingLand: null,
      isTrainStation: null,
    }),
  );

  /* ----- */

  const expectationsBeachDoor1 = await doorBlocksRepository.create(
    new DoorBlock({
      inTerritory: Promise.resolve(null),
      inLand: expectationsBeach,
      toLand: expectationsBeach,
    }),
  );

  const expectationsBeachDoor2 = await doorBlocksRepository.create(
    new DoorBlock({
      inTerritory: Promise.resolve(null),
      inLand: expectationsBeach,
      toLand: townOfHumbleBeginnings,
    }),
  );

  const expectationsBeachMapString = await readFile(
    path.resolve(
      process.cwd(),
      'src/land/spec/assets/expectations-beach-map.json',
    ),
    { encoding: 'utf-8' },
  );
  const expectationsBeachTileset = await readFile(
    path.resolve(
      process.cwd(),
      'src/land/spec/assets/expectations-beach-tileset.png',
    ),
  );

  const expectationsBeachMap = createTiledJSONSchema({
    maxWidth: null,
    maxHeight: null,
  }).parse(JSON.parse(expectationsBeachMapString) as unknown);


  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  expectationsBeachMap.tilesets[0]!.tiles =
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    expectationsBeachMap.tilesets[0]!.tiles.map((tile) => {
      return {
        ...tile,
        properties: tile.properties?.map((prop) => {
          if (prop.name === 'start') {
            return {
              name: "start",
              type: "string" as const,
              value: `door:${expectationsBeachDoor1.id}`,
            };
          } else if (prop.name === 'town') {
            return {
              name: "town",
              type: "string" as const,
              value: `door:${expectationsBeachDoor2.id}`,
            };
          } else {
            return prop;
          }
        }),
      };
    });

  await storageService.saveText(
    `lands/${expectationsBeach.id}/map.json`,
    JSON.stringify(expectationsBeachMap),
  );
  await storageService.saveBuffer(
    `lands/${expectationsBeach.id}/tileset.png`,
    expectationsBeachTileset,
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

  const townOfHumbleBeginningsDoor3 = await doorBlocksRepository.create(
    new DoorBlock({
      inTerritory: Promise.resolve(null),
      inLand: townOfHumbleBeginnings,
      toLand: townOfHumbleBeginningsTemple,
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

  const townOfHumbleBeginningsMap = createTiledJSONSchema({
    maxWidth: null,
    maxHeight: null,
  }).parse(JSON.parse(townOfHumbleBeginningsMapString) as unknown);



  const { trainStationEntrance } = await seedTrainStation({
    landOutside: townOfHumbleBeginnings,
    storageService,
    eM: defaultDBConnection.createEntityManager(),
  });

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
          } else if (prop.name === 'temple') {
            return {
              ...prop,
              value: `door:${townOfHumbleBeginningsDoor3.id}`,
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
              ...prop,
              value: `door:${expectationsBeachDoor2.id}`,
            };
          } else if (prop.name === 'train-station-entrance') {
            return {
              ...prop,
              value: `door:${trainStationEntrance.id}`,
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

  /* ----- */

  const townOfHumbleBeginningsTempleMapString = await readFile(
    path.resolve(
      process.cwd(),
      'src/land/spec/assets/town-of-humble-beginnings-temple-map.json',
    ),
    { encoding: 'utf-8' },
  );
  const townOfHumbleBeginningsTempleTileset = await readFile(
    path.resolve(
      process.cwd(),
      'src/land/spec/assets/town-of-humble-beginnings-temple-tileset.png',
    ),
  );

  const townOfHumbleBeginningsTempleMap = createTiledJSONSchema({
    maxWidth: null,
    maxHeight: null,
  }).parse(JSON.parse(townOfHumbleBeginningsTempleMapString) as unknown);

  

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  townOfHumbleBeginningsTempleMap.tilesets[0]!.tiles =
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    townOfHumbleBeginningsTempleMap.tilesets[0]!.tiles.map((tile) => {
      return {
        ...tile,
        properties: tile.properties?.map((prop) => {
          if (prop.name === 'town') {
            return {
              ...prop,
              value: `door:${townOfHumbleBeginningsDoor3.id}`,
            };
          } else {
            return prop;
          }
        }),
      };
    });

  await storageService.saveText(
    `lands/${townOfHumbleBeginningsTemple.id}/map.json`,
    JSON.stringify(townOfHumbleBeginningsTempleMap),
  );
  await storageService.saveBuffer(
    `lands/${townOfHumbleBeginningsTemple.id}/tileset.png`,
    townOfHumbleBeginningsTempleTileset,
  );

  /* ----- */

  const territoriesRepository = defaultDBConnection.getCustomRepository(
    TerritoriesRepository,
  );

  const territory1 = await territoriesRepository.create(
    new Territory({
      doorBlocks: [],
      appBlocks: [],
      hasAssets: true,
      inLand: Promise.resolve(townOfHumbleBeginnings),
      startX: 3,
      startY: 3,
      endX: 7,
      endY: 6,
    }),
  );

  const territory1Map = await readFile(
    path.resolve(process.cwd(), 'src/territories/spec/territory-map.json'),
    { encoding: 'utf-8' },
  );
  const terrritory1Tileset = await readFile(
    path.resolve(process.cwd(), 'src/territories/spec/territory-tileset.png'),
  );
  const terrritory1Thumbnail = await readFile(
    path.resolve(process.cwd(), 'src/territories/spec/territory-thumbnail.jpg'),
  );
  await storageService.saveText(
    `territories/${territory1.id}/map.json`,
    territory1Map,
  );
  await storageService.saveBuffer(
    `territories/${territory1.id}/tileset.png`,
    terrritory1Tileset,
  );
  await storageService.saveBuffer(
    `territories/${territory1.id}/thumbnail.jpg`,
    terrritory1Thumbnail,
  );

 
  await territoriesRepository.save(territory1);
  /* --- */

  await seedUserLand({
    storageService,
    eM: defaultDBConnection.createEntityManager(),
    appBlocksRepository,
    user: endUser,
  });

  await Promise.all([defaultDBConnection.close()]);
}

seed().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
