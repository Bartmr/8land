import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StorageModule } from 'src/internals/storage/storage.module';
import { LandController } from './land.controller';
import { DoorBlock } from '../blocks/typeorm/door-block.entity';
import { Land } from './typeorm/land.entity';
import { Territory } from 'src/territories/typeorm/territory.entity';
import { AppBlock } from 'src/blocks/typeorm/app-block.entity';
import { LandsService } from './lands.service';
import { LandsInGameController } from './lands-in-game.controller';
import { NavigationState } from 'src/users/typeorm/navigation-state.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Land,
      Territory,
      DoorBlock,
      AppBlock,
      NavigationState,
    ]),
    StorageModule,
  ],
  providers: [LandsService],
  controllers: [LandController, LandsInGameController],
})
export class LandModule {}
