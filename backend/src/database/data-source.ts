import 'dotenv/config'

import { DataSource } from "typeorm";
import { EnvironmentVariables } from 'src/environment-variables/environment-variables';
import { AppBlock } from 'src/blocks/app-block.entities';
import { DoorBlock } from 'src/blocks/door-block.entities';
import { Land } from 'src/land/land.entities';
import { NavigationState } from 'src/navigation/state/navigation-state.entities';
import { UserAuthSession } from 'src/users/auth/sessions/auth-session.entities';
import { World } from 'src/worlds/worlds.entities';
import { User } from 'src/users/user.entities';
import { DataSourceOptions } from 'typeorm/browser';
import { Initialize1780932515218 } from 'src/database/migrations/1780932515218-initialize';

export const AppDataSourceOptions: DataSourceOptions = {
  type: 'postgres' as const,
  host: EnvironmentVariables.DATABASE_HOST,
  port: EnvironmentVariables.DATABASE_PORT,
  username: EnvironmentVariables.DATABASE_USER,
  password: EnvironmentVariables.DATABASE_PASSWORD,
  database: EnvironmentVariables.DATABASE_NAME,
  entities: [
    AppBlock,
    DoorBlock,
    Land,
    NavigationState,
    UserAuthSession,
    World,
    User,
  ],
  subscribers: [],
  synchronize: false,
  logging: EnvironmentVariables.LOG_DATABASES,
  /*
    Migrations should be explicitly run by the CLI,
    or called manually, like when testing or hot reloading migrations.

    This is in order to avoid importing migrations (and with it, their module trees)
    into the API runtime when not needed (specially important in production).
  */
  migrationsRun: true,
  migrations: [
    Initialize1780932515218
  ],
}
export const AppDataSource = new DataSource(AppDataSourceOptions)