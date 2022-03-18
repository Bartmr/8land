import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DoorBlock } from './typeorm/door-block.entity';
import { Land } from 'src/land/typeorm/land.entity';
import { BlocksController } from './blocks.controller';
import { AppBlock } from './typeorm/app-block.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Land, DoorBlock, AppBlock])],
  controllers: [BlocksController],
})
export class BlocksModule {}
