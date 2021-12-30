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

async function seed() {
  const FIREBASE_AUTH_EMULATOR_HOST =
    EnvironmentVariablesService.variables.FIREBASE_AUTH_EMULATOR_HOST;
  if (NODE_ENV === NodeEnv.Development && FIREBASE_AUTH_EMULATOR_HOST) {
    ProcessContextManager.setContext({
      type: ProcessType.Script,
      name: 'scripts-dev:seed',
      workerId: generateRandomUUID(),
    });

    const { DEFAULT_DATABASE_TYPEORM_CONNECTION_OPTIONS } = await import(
      'src/internals/databases/typeorm-ormconfig-with-migrations'
    );

    const defaultDBConnection = await createConnection({
      ...DEFAULT_DATABASE_TYPEORM_CONNECTION_OPTIONS,
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
