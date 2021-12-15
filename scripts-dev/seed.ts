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

async function seed() {
  if (NODE_ENV === NodeEnv.Development) {
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

    await defaultDBConnection.runMigrations();

    if (!EnvironmentVariablesService.variables.FIREBASE_AUTH_EMULATOR_HOST) {
      throw new Error();
    }

    const app = firebaseAdmin.initializeApp({ projectId: `8land-${NODE_ENV}` });

    const usersRepository =
      defaultDBConnection.getCustomRepository(UsersRepository);

    const auditContext = new AuditContext({
      operationId: generateRandomUUID(),
      requestMethod: undefined,
      requestPath: undefined,
      authContext: undefined,
    });

    await usersRepository.create(
      {
        firebaseUid: (
          await app
            .auth()
            .createUser({ email: 'end-user@8land.com', emailVerified: true })
        ).uid,
        role: Role.EndUser,
      },
      auditContext,
    );

    await usersRepository.create(
      {
        firebaseUid: (
          await app
            .auth()
            .createUser({ email: 'admin@8land.com', emailVerified: true })
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
