import { Module } from '@nestjs/common';
import { StorageModule } from 'src/storage/storage.module';
import { DoorBlock } from '../blocks/door-block.entity';
import { Land } from './land.entity';
import { Territory } from 'src/territories/territory.entity';
import { AppBlock } from 'src/blocks/app-block.entity';
import { LandsService } from './lands.service';
import { LandsInGameController } from './lands-in-game.controller';
import { NavigationState } from 'src/navigation/state/navigation-state.entity';
import { LandsController } from './land.controller';
import { World } from '../worlds/worlds.entity';
import { LandPersistenceService } from './land-persistence.service';
import { SettingsModule } from 'src/settings/settings.module';
import { TypeormFeatureModule } from 'src/databases/typeorm.module';
import { AuthModule } from 'src/users/auth/auth.module';

@Module({
  imports: [
    TypeormFeatureModule.forFeature({
      entities: [Land, Territory, DoorBlock, AppBlock, NavigationState, World],
    }),
    StorageModule,
    SettingsModule,
    AuthModule,
  ],
  exports: [LandsService],
  providers: [LandsService, LandPersistenceService],
  controllers: [LandsController, LandsInGameController],
})
export class LandModule {}
