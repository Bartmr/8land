import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlockEntry } from './typeorm/block-entry.entity';
import { DoorBlock } from './typeorm/door-block.entity';
import { Land } from 'src/land/typeorm/land.entity';
import { BlocksController } from './blocks.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Land, BlockEntry, DoorBlock])],
  controllers: [BlocksController],
})
export class BlocksModule {}
