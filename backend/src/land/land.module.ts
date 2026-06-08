import { Module } from '@nestjs/common';
import { StorageModule } from 'src/storage/storage.module';
import { DoorBlock } from '../blocks/door-block.entity';
import { Land } from './land.entity';
import { AppBlock } from 'src/blocks/app-block.entity';
import { NavigationState } from 'src/navigation/state/navigation-state.entity';
import { LandsController } from './land.controller';
import { World } from '../worlds/worlds.entity';
import { LandService } from './land.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/users/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Land, DoorBlock, AppBlock, NavigationState, World]),
    StorageModule,
    AuthModule,
  ],
  exports: [LandService],
  providers: [LandService],
  controllers: [LandsController],
})
export class LandModule {}
