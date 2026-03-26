import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './users/auth/auth.module';
import { LandModule } from './land/land.module';
import { BlocksModule } from './blocks/blocks.module';
// import { TerritoriesModule } from './territories/territories.module';
import { UsersModule } from './users/users.module';
import { TrainModule } from './train/train.module';

import { TYPEORM_ORMCONFIG } from './databases/ormconfig';

@Module({
  imports: [
    TypeOrmModule.forRoot(TYPEORM_ORMCONFIG),
    AuthModule,
    LandModule,
    BlocksModule,
    // TerritoriesModule,
    UsersModule,
    TrainModule,
  ],
})
export class AppModule {}
