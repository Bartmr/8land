import { Module } from '@nestjs/common';
import { StorageModule } from 'src/internals/storage/storage.module';
import { DoorBlock } from '../blocks/typeorm/door-block.entity';
import { Land } from './typeorm/land.entity';
import { Territory } from 'src/territories/typeorm/territory.entity';
import { AppBlock } from 'src/blocks/typeorm/app-block.entity';
import { LandsService } from './lands.service';
import { LandsInGameController } from './lands-in-game.controller';
import { NavigationState } from 'src/users/typeorm/navigation-state.entity';
import { LandsController } from './land.controller';
import { World } from '../worlds/typeorm/worlds.entity';
import { LandPersistenceService } from './land-persistence.service';
import { SettingsModule } from 'src/settings/settings.module';
import { TypeormFeatureModule } from 'src/internals/databases/typeorm.module';

@Module({
  imports: [
    TypeormFeatureModule.forFeature({
      entities: [Land, Territory, DoorBlock, AppBlock, NavigationState, World],
    }),
    StorageModule,
    SettingsModule,
  ],
  exports: [LandsService],
  providers: [LandsService, LandPersistenceService],
  controllers: [LandsController, LandsInGameController],
})
export class LandModule {}
