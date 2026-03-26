import { ConnectionOptions } from 'typeorm';
import { FirstMigration1642874083482 } from '../../migrations/1642874083482-FirstMigration';
import { NFTMetadata1645870824982 } from '../../migrations/1645870824982-NFTMetadata';
import { UserAppId1647382874239 } from '../../migrations/1647382874239-UserAppId';
import { NavigationState1649620686884 } from '../../migrations/1649620686884-NavigationState';
import { Train1651758178120 } from '../../migrations/1651758178120-Train';


export const TYPEORM_ORMCONFIG: ConnectionOptions = {
  type: 'postgres' as const,
  host: EnvironmentVariablesService.variables.DATABASE_HOST,
  port: EnvironmentVariablesService.variables.DATABASE_PORT,
  username: EnvironmentVariablesService.variables.DATABASE_USER,
  password: EnvironmentVariablesService.variables.DATABASE_PASSWORD,
  database: EnvironmentVariablesService.variables.DATABASE_NAME,
  entities: [],
  subscribers: [],
  synchronize: false,
  logging: EnvironmentVariablesService.variables.LOG_DATABASES,
  /*
    Migrations should be explicitly run by the CLI,
    or called manually, like when testing or hot reloading migrations.

    This is in order to avoid importing migrations (and with it, their module trees)
    into the API runtime when not needed (specially important in production).
  */
  migrationsRun: false,
  migrations: [
    FirstMigration1642874083482,
    NFTMetadata1645870824982,
    UserAppId1647382874239,
    NavigationState1649620686884,
    Train1651758178120,
  ],
  cli: {
    migrationsDir: 'migrations',
  },
  installExtensions: false,
};
