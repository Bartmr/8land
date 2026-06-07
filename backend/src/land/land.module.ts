import { Module } from '@nestjs/common';
import { StorageModule } from 'src/storage/storage.module';
import { DoorBlock } from '../blocks/door-block.entity';
import { Land } from './land.entity';
import { Territory } from 'src/territories/territory.entity';
import { AppBlock } from 'src/blocks/app-block.entity';
import { LandsInGameService } from './lands-in-game.service';
import { LandsInGameController } from './lands-in-game.controller';
import { NavigationState } from 'src/navigation/state/navigation-state.entity';
import { LandsController } from './land.controller';
import { World } from '../worlds/worlds.entity';
import { LandService } from './land.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/users/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Land, Territory, DoorBlock, AppBlock, NavigationState, World]),
    StorageModule,
    AuthModule,
  ],
  exports: [LandsInGameService],
  providers: [LandsInGameService, LandService],
  controllers: [LandsController, LandsInGameController],
})
export class LandModule {}
