import { ConnectionOptions } from 'typeorm';

export const TYPEORM_ORMCONFIG: ConnectionOptions[] = {
  type: 'postgres' as const,
  host: EnvironmentVariablesService.variables.DATABASE_HOST,
  port: EnvironmentVariablesService.variables.DATABASE_PORT,
  username: EnvironmentVariablesService.variables.DATABASE_USER,
  password: EnvironmentVariablesService.variables.DATABASE_PASSWORD,
  database: EnvironmentVariablesService.variables.DATABASE_NAME,
  entities: ['src/**/typeorm/*.entity.ts'],
  subscribers: ALL_SUBSCRIBERS,
  synchronize: false,
  logging: EnvironmentVariablesService.variables.LOG_DATABASES,
  /*
    Migrations should be explicitly run by the CLI,
    or called manually, like when testing or hot reloading migrations.

    This is in order to avoid importing migrations (and with it, their module trees)
    into the API runtime when not needed (specially important in production).
  */
  migrationsRun: false,
  migrations: ALL_MIGRATIONS,
  cli: {
    migrationsDir: 'migrations',
  },
  installExtensions: false,
  ssl: EnvironmentVariablesService.variables.DATABASE_CA_CERTIFICATE
    ? {
        ca: EnvironmentVariablesService.variables.DATABASE_CA_CERTIFICATE,
      }
    : undefined,
};
