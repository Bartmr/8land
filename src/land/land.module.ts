import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StorageModule } from 'src/internals/storage/storage.module';
import { LandController } from './land.controller';
import { BlockEntry } from '../blocks/typeorm/block-entry.entity';
import { DoorBlock } from '../blocks/typeorm/door-block.entity';
import { Land } from './typeorm/land.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Land, BlockEntry, DoorBlock]),
    StorageModule,
  ],
  controllers: [LandController],
})
export class LandModule {}
