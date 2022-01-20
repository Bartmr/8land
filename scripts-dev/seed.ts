import 'source-map-support/register';
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
import { getSearchableName } from 'src/internals/utils/get-searchable-name';
import { BlockEntryRepository } from 'src/blocks/typeorm/block-entry.repository';
import { DoorBlockRepository } from 'src/blocks/typeorm/door-block.repository';
import fs from 'fs';
import { promisify } from 'util';
import path from 'path';
import { DevStorageService } from 'src/internals/storage/dev-storage.service';

const readFile = promisify(fs.readFile);

async function seed() {
  const FIREBASE_AUTH_EMULATOR_HOST =
    EnvironmentVariablesService.variables.FIREBASE_AUTH_EMULATOR_HOST;
  if (NODE_ENV === NodeEnv.Development && FIREBASE_AUTH_EMULATOR_HOST) {
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

    await usersRepository.create(
      {
        firebaseUid: (
          await firebaseAuth.createUser({
            email: 'end-user@8land.com',
            emailVerified: true,
            password: 'password123',
          })
        ).uid,
        role: Role.EndUser,
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
      },
      auditContext,
    );

    const landsRepository =
      defaultDBConnection.getCustomRepository(LandRepository);
    const blockEntriesRepository =
      defaultDBConnection.getCustomRepository(BlockEntryRepository);
    const doorBlocksRepository =
      defaultDBConnection.getCustomRepository(DoorBlockRepository);
    const storageService = new DevStorageService();

    const expectationsBeach = await landsRepository.create(
      {
        name: 'Expectations Beach',
        searchableName: getSearchableName('Expectations Beach'),
        backgroundMusicUrl: 'https://api.soundcloud.com/tracks/256813580',
        blocks: Promise.resolve([]),
        hasAssets: true,
        territories: [],
      },
      auditContext,
    );

    const townOfHumbleBeginnings = await landsRepository.create(
      {
        name: 'Town of Humble Beginnings',
        searchableName: getSearchableName('Town of Humble Beginnings'),
        backgroundMusicUrl: 'https://api.soundcloud.com/tracks/566456658',
        blocks: Promise.resolve([]),
        hasAssets: true,
        territories: [],
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
        blocks: Promise.resolve([]),
        hasAssets: true,
        territories: [],
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
        blocks: Promise.resolve([]),
        hasAssets: true,
        territories: [],
      },
      auditContext,
    );

    /* ----- */

    const expectationsBeachDoor1 = await blockEntriesRepository.create(
      {
        territory: null,
        land: expectationsBeach,
        door: await doorBlocksRepository.create(
          {
            toLand: expectationsBeach,
          },
          auditContext,
        ),
      },
      auditContext,
    );

    const expectationsBeachDoor2 = await blockEntriesRepository.create(
      {
        territory: null,
        land: expectationsBeach,
        door: await doorBlocksRepository.create(
          {
            toLand: townOfHumbleBeginnings,
          },
          auditContext,
        ),
      },
      auditContext,
    );

    const expectationsBeachMap = await readFile(
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
    await storageService.saveText(
      `lands/${expectationsBeach.id}/map.json`,
      expectationsBeachMap
        .replaceAll('<door-1>', expectationsBeachDoor1.id)
        .replaceAll('<door-2>', expectationsBeachDoor2.id),
    );
    await storageService.saveBuffer(
      `lands/${expectationsBeach.id}/tileset.png`,
      expectationsBeachTileset,
    );

    /* ----- */

    const townOfHumbleBeginningsDoor1 = await blockEntriesRepository.create(
      {
        territory: null,
        land: townOfHumbleBeginnings,
        door: await doorBlocksRepository.create(
          {
            toLand: townOfHumbleBeginningsUnderground1,
          },
          auditContext,
        ),
      },
      auditContext,
    );

    const townOfHumbleBeginningsDoor2 = await blockEntriesRepository.create(
      {
        territory: null,
        land: townOfHumbleBeginnings,
        door: await doorBlocksRepository.create(
          {
            toLand: townOfHumbleBeginningsUnderground2,
          },
          auditContext,
        ),
      },
      auditContext,
    );

    const townOfHumbleBeginningsMap = await readFile(
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
    await storageService.saveText(
      `lands/${townOfHumbleBeginnings.id}/map.json`,
      townOfHumbleBeginningsMap
        .replaceAll('<door-1>', expectationsBeachDoor2.id)
        .replaceAll('<door-2>', townOfHumbleBeginningsDoor1.id)
        .replaceAll('<door-3>', townOfHumbleBeginningsDoor2.id),
    );
    await storageService.saveBuffer(
      `lands/${townOfHumbleBeginnings.id}/tileset.png`,
      townOfHumbleBeginningsTileset,
    );

    /* ----- */

    const townOfHumbleBeginningsUnderground1Door1 =
      await blockEntriesRepository.create(
        {
          territory: null,
          land: townOfHumbleBeginningsUnderground1,
          door: await doorBlocksRepository.create(
            {
              toLand: townOfHumbleBeginningsUnderground2,
            },
            auditContext,
          ),
        },
        auditContext,
      );

    const townOfHumbleBeginningsUnderground1Map = await readFile(
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
    await storageService.saveText(
      `lands/${townOfHumbleBeginningsUnderground1.id}/map.json`,
      townOfHumbleBeginningsUnderground1Map
        .replaceAll('<door-1>', townOfHumbleBeginningsDoor1.id)
        .replaceAll('<door-2>', townOfHumbleBeginningsUnderground1Door1.id),
    );
    await storageService.saveBuffer(
      `lands/${townOfHumbleBeginningsUnderground1.id}/tileset.png`,
      townOfHumbleBeginningsUnderground1Tileset,
    );

    /* ----- */

    const townOfHumbleBeginningsUnderground2Map = await readFile(
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
    await storageService.saveText(
      `lands/${townOfHumbleBeginningsUnderground2.id}/map.json`,
      townOfHumbleBeginningsUnderground2Map
        .replaceAll('<door-1>', townOfHumbleBeginningsUnderground1Door1.id)
        .replaceAll('<door-2>', townOfHumbleBeginningsDoor2.id),
    );
    await storageService.saveBuffer(
      `lands/${townOfHumbleBeginningsUnderground2.id}/tileset.png`,
      townOfHumbleBeginningsUnderground2Tileset,
    );

    await Promise.all([defaultDBConnection.close()]);
  } else {
    throw new Error('Seed command is only for development');
  }
}

seed().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
