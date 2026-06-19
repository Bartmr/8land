import { Module } from '@nestjs/common';
import { StorageModule } from 'src/storage/storage.module';
import { DoorBlock } from '../blocks/door-block.entities';
import { Land } from './land.entities';
import { AppBlock } from 'src/blocks/app-block.entities';
import { NavigationState } from 'src/navigation/state/navigation-state.entities';
import { LandsController } from './land.controller';
import { World } from '../worlds/worlds.entities';
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
