import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './features/users/auth/auth.module';
import { LandModule } from './features/land/land.module';
import { BlocksModule } from './features/blocks/blocks.module';
import { UsersModule } from './features/users/users.module';
import { TrainModule } from './features/train/train.module';
import { AppDataSourceOptions } from './core/database/data-source';


@Module({
  imports: [
    TypeOrmModule.forRoot(AppDataSourceOptions),
    AuthModule,
    LandModule,
    BlocksModule,
    UsersModule,
    TrainModule,
  ],
})
export class AppModule {}
