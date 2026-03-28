import { ConnectionOptions } from 'typeorm';
import { EnvironmentVariables } from 'src/environment/environment-variables';


export const TYPEORM_ORMCONFIG: ConnectionOptions = {
  type: 'postgres' as const,
  host: EnvironmentVariables.DATABASE_HOST,
  port: EnvironmentVariables.DATABASE_PORT,
  username: EnvironmentVariables.DATABASE_USER,
  password: EnvironmentVariables.DATABASE_PASSWORD,
  database: EnvironmentVariables.DATABASE_NAME,
  entities: [],
  subscribers: [],
  synchronize: false,
  logging: EnvironmentVariables.LOG_DATABASES,
  /*
    Migrations should be explicitly run by the CLI,
    or called manually, like when testing or hot reloading migrations.

    This is in order to avoid importing migrations (and with it, their module trees)
    into the API runtime when not needed (specially important in production).
  */
  migrationsRun: false,
  migrations: [
  ],
};
