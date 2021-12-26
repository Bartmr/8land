import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StorageModule } from 'src/internals/storage/storage.module';
import { LandController } from './land.controller';
import { BlockEntry } from './typeorm/block-entry.entity';
import { DoorBlock } from './typeorm/door-block.entity';
import { LandAssets } from './typeorm/land-assets.entity';
import { Land } from './typeorm/land.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Land, LandAssets, BlockEntry, DoorBlock]),
    StorageModule,
  ],
  controllers: [LandController],
})
export class LandModule {}
