import 'src/internals/environment/load-environment-variables';

import { tearDownDatabases } from 'test-environment-impl/base/tear-down-databases';
import { createConnection } from 'typeorm';
import { NODE_ENV } from 'src/internals/environment/node-env.constants';
import { NodeEnv } from 'src/internals/environment/node-env.types';
import { ProcessContextManager } from 'src/internals/process/process-context-manager';
import { ProcessType } from 'src/internals/process/process-context';
import { generateRandomUUID } from 'src/internals/utils/generate-random-uuid';
import { EnvironmentVariablesService } from 'src/internals/environment/environment-variables.service';
import * as firebaseAdmin from 'firebase-admin';
import { UsersRepository } from 'src/users/users.repository';
import { AuditContext } from 'src/internals/auditing/audit-context';
import { Role } from 'src/auth/roles/roles';
import { JSONApiBase } from 'src/internals/apis/json-api-base';
import { LoggingServiceSingleton } from 'src/internals/logging/logging.service.singleton';
import { object } from 'not-me/lib/schemas/object/object-schema';
import { equals } from 'not-me/lib/schemas/equals/equals-schema';
import { FIREBASE_EMULATOR_PROJECT_ID } from 'src/internals/apis/firebase/firebase.constants';
import { throwError } from 'src/internals/utils/throw-error';
import { LandRepository } from 'src/land/typeorm/land.repository';
import { TerritoriesRepository } from 'src/territories/typeorm/territories.repository';
import { getSearchableName } from 'src/internals/utils/get-searchable-name';
import { DoorBlockRepository } from 'src/blocks/typeorm/door-block.repository';
import fs from 'fs';
import { promisify } from 'util';
import path from 'path';
import { DevStorageService } from 'src/internals/storage/dev-storage.service';
import { LOCAL_TEMPORARY_FILES_PATH } from 'src/internals/local-temporary-files/local-temporary-files-path';
import { AppBlockRepository } from 'src/blocks/typeorm/app-block.repository';
import { createTiledJSONSchema } from 'libs/shared/src/land/upload-assets/upload-land-assets.schemas';
import { seedTrainStation } from './seed/seed-train-station';
import { seedUserLand } from './seed/seed-user-land';

const readFile = promisify(fs.readFile);
const rm = promisify(fs.rm);

if (NODE_ENV !== NodeEnv.Development) {
  throw new Error('Seed command is only for development');
}

async function seed() {
  const FIREBASE_AUTH_EMULATOR_HOST =
    EnvironmentVariablesService.variables.FIREBASE_AUTH_EMULATOR_HOST;

  if (!FIREBASE_AUTH_EMULATOR_HOST) {
    throw new Error('Must use Firebase Auth Emulator for seeding');
  }

  ProcessContextManager.setContext({
    type: ProcessType.Script,
    name: 'scripts-dev:seed',
    workerId: generateRandomUUID(),
  });

  const { DEFAULT_DB_TYPEORM_CONN_OPTS_WITH_MIGRATIONS } = await import(
    'src/internals/databases/typeorm-ormconfig-with-migrations'
  );

  const defaultDBConnection = await createConnection({
    ...DEFAULT_DB_TYPEORM_CONN_OPTS_WITH_MIGRATIONS,
    entities: ['src/**/typeorm/*.entity.ts'],
  });

  await tearDownDatabases([defaultDBConnection]);
  try {
    await rm(LOCAL_TEMPORARY_FILES_PATH, { recursive: true });
  } catch (err) {
    // NOOP
  }

  const firebaseProjectId = FIREBASE_EMULATOR_PROJECT_ID || throwError();

  const firebaseApp = firebaseAdmin.initializeApp({
    projectId: firebaseProjectId,
  });
  const firebaseAuth = firebaseApp.auth();

  const firebaseAuthEmulatorHost = FIREBASE_AUTH_EMULATOR_HOST;

  class FirebaseAuthEmulatorApi extends JSONApiBase {
    protected apiUrl = `http://${firebaseAuthEmulatorHost}/emulator/v1/projects/${firebaseProjectId}`;
    protected loggingService = LoggingServiceSingleton.makeInstance();
    protected getDefaultHeaders = () => ({});
  }

  const firebaseEmulatorApi = new FirebaseAuthEmulatorApi();

  await firebaseEmulatorApi.delete(
    object({
      status: equals([200] as const).required(),
      body: object({}).required(),
    }).required(),
    {
      path: `/accounts`,
    },
  );

  await defaultDBConnection.runMigrations();

  const usersRepository =
    defaultDBConnection.getCustomRepository(UsersRepository);

  const auditContext = new AuditContext({
    operationId: generateRandomUUID(),
    requestMethod: null,
    requestPath: null,
    authContext: null,
  });

  const endUser = await usersRepository.create(
    {
      firebaseUid: (
        await firebaseAuth.createUser({
          email: 'end-user@8land.com',
          emailVerified: true,
          password: 'password123',
        })
      ).uid,
      role: Role.EndUser,
      walletAddress: null,
      walletNonce: generateRandomUUID(),
      appId: generateRandomUUID(),
    },
    auditContext,
  );

  await usersRepository.create(
    {
      firebaseUid: (
        await firebaseAuth.createUser({
          email: 'admin@8land.com',
          emailVerified: true,
          password: 'password123',
        })
      ).uid,
      role: Role.Admin,
      walletAddress: null,
      walletNonce: generateRandomUUID(),
      appId: generateRandomUUID(),
    },
    auditContext,
  );

  const landsRepository =
    defaultDBConnection.getCustomRepository(LandRepository);
  const doorBlocksRepository =
    defaultDBConnection.getCustomRepository(DoorBlockRepository);
  const appBlocksRepository =
    defaultDBConnection.getCustomRepository(AppBlockRepository);
  const storageService = new DevStorageService();

  const expectationsBeach = await landsRepository.create(
    {
      name: 'Expectations Beach',
      searchableName: getSearchableName('Expectations Beach'),
      backgroundMusicUrl: 'https://api.soundcloud.com/tracks/256813580',
      doorBlocks: Promise.resolve([]),
      doorBlocksReferencing: Promise.resolve([]),
      appBlocks: [],
      hasAssets: true,
      territories: Promise.resolve([]),
      world: null,
      isStartingLand: null,
      isTrainStation: null,
    },
    auditContext,
  );

  const townOfHumbleBeginnings = await landsRepository.create(
    {
      name: 'Town of Humble Beginnings',
      searchableName: getSearchableName('Town of Humble Beginnings'),
      backgroundMusicUrl: 'https://api.soundcloud.com/tracks/566456658',
      doorBlocks: Promise.resolve([]),
      doorBlocksReferencing: Promise.resolve([]),
      appBlocks: [],
      hasAssets: true,
      territories: Promise.resolve([]),
      world: null,
      isStartingLand: null,
      isTrainStation: null,
    },
    auditContext,
  );

  const townOfHumbleBeginningsUnderground1 = await landsRepository.create(
    {
      name: 'Town of Humble Beginnings - Underground 1',
      searchableName: getSearchableName(
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
    },
    auditContext,
  );

  const townOfHumbleBeginningsUnderground2 = await landsRepository.create(
    {
      name: 'Town of Humble Beginnings - Underground 2',
      searchableName: getSearchableName(
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
    },
    auditContext,
  );

  const townOfHumbleBeginningsTemple = await landsRepository.create(
    {
      name: 'Town of Humble Beginnings - Temple',
      searchableName: getSearchableName('Town of Humble Beginnings - Temple'),
      backgroundMusicUrl: null,
      doorBlocks: Promise.resolve([]),
      doorBlocksReferencing: Promise.resolve([]),
      appBlocks: [],
      hasAssets: true,
      territories: Promise.resolve([]),
      world: null,
      isStartingLand: null,
      isTrainStation: null,
    },
    auditContext,
  );

  /* ----- */

  const expectationsBeachDoor1 = await doorBlocksRepository.create(
    {
      inTerritory: Promise.resolve(null),
      inLand: expectationsBeach,
      toLand: expectationsBeach,
    },
    auditContext,
  );

  const expectationsBeachDoor2 = await doorBlocksRepository.create(
    {
      inTerritory: Promise.resolve(null),
      inLand: expectationsBeach,
      toLand: townOfHumbleBeginnings,
    },
    auditContext,
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

  const expectationsBeachMapRes = createTiledJSONSchema({
    maxWidth: null,
    maxHeight: null,
  }).validate(JSON.parse(expectationsBeachMapString) as unknown);

  if (expectationsBeachMapRes.errors) {
    throw new Error(JSON.stringify(expectationsBeachMapRes.messagesTree));
  }

  const expectationsBeachMap = expectationsBeachMapRes.value;

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  expectationsBeachMap.tilesets[0]!.tiles =
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    expectationsBeachMap.tilesets[0]!.tiles.map((tile) => {
      return {
        ...tile,
        properties: tile.properties?.map((prop) => {
          if (prop.name === 'start') {
            return {
              ...prop,
              value: `door:${expectationsBeachDoor1.id}`,
            };
          } else if (prop.name === 'town') {
            return {
              ...prop,
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

  const townOfHumbleBeginningsDoor3 = await doorBlocksRepository.create(
    {
      inTerritory: Promise.resolve(null),
      inLand: townOfHumbleBeginnings,
      toLand: townOfHumbleBeginningsTemple,
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

  const { trainStationEntrance } = await seedTrainStation({
    landOutside: townOfHumbleBeginnings,
    auditContext,
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

  const townOfHumbleBeginningsTempleMapRes = createTiledJSONSchema({
    maxWidth: null,
    maxHeight: null,
  }).validate(JSON.parse(townOfHumbleBeginningsTempleMapString) as unknown);

  if (townOfHumbleBeginningsTempleMapRes.errors) {
    throw new Error(
      JSON.stringify(townOfHumbleBeginningsTempleMapRes.messagesTree),
    );
  }

  const townOfHumbleBeginningsTempleMap =
    townOfHumbleBeginningsTempleMapRes.value;

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
    {
      doorBlocks: [],
      appBlocks: [],
      hasAssets: true,
      inLand: Promise.resolve(townOfHumbleBeginnings),
      startX: 3,
      startY: 3,
      endX: 7,
      endY: 6,
      tokenId: null,
      tokenAddress: null,
    },
    auditContext,
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

  const nftMetadataStorageKey = `territories/${territory1.id}/nft-metadata.json`;

  await storageService.saveText(
    nftMetadataStorageKey,
    JSON.stringify({
      attributes: [
        {
          trait_type: 'Territory ID',
          value: `${territory1.id}`,
        },
        {
          trait_type: 'In Land',
          value: `${townOfHumbleBeginnings.name}`,
        },
        {
          trait_type: 'Width',
          value: `${territory1.endX - territory1.startX}`,
        },
        {
          trait_type: 'Height',
          value: `${territory1.endY - territory1.startY}`,
        },
        {
          trait_type: 'Total Area',
          value: `${
            (territory1.endX - territory1.startX) *
            (territory1.endY - territory1.startY)
          }`,
        },
      ],
      description: `8Land territory at ${townOfHumbleBeginnings.name}`,
      image: `${storageService.getHostUrl()}/territories/${
        territory1.id
      }/thumbnail.jpg`,
      name: `${townOfHumbleBeginnings.name} - territory 1`,
    }),
  );

  await territoriesRepository.save(territory1, auditContext);
  /* --- */

  await seedUserLand({
    auditContext,
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
