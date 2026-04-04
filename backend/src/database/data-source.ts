import 'dotenv/config'

import { DataSource } from "typeorm";
import { EnvironmentVariables } from 'src/environment/environment-variables';
import { AppBlock } from 'src/blocks/app-block.entity';
import { DoorBlock } from 'src/blocks/door-block.entity';
import { Land } from 'src/land/land.entity';
import { NavigationState } from 'src/navigation/state/navigation-state.entity';
import { Territory } from 'src/territories/territory.entity';
import { AuthToken } from 'src/users/auth/tokens/auth-token.entity';
import { World } from 'src/worlds/worlds.entity';
import { User } from 'src/users/user.entity';
import { Squash1775318794517 } from 'src/database/migrations/1775318794517-squash';
import { DataSourceOptions } from 'typeorm/browser';

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
    Territory,
    AuthToken,
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
    Squash1775318794517
  ],
}
export const AppDataSource = new DataSource(AppDataSourceOptions)