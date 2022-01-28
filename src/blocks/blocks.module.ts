import { Module } from '@nestjs/common';
import { TypeOrmModule } from 'nestjs-typeorm-bartmr';
import { DoorBlock } from './typeorm/door-block.entity';
import { Land } from 'src/land/typeorm/land.entity';
import { BlocksController } from './blocks.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Land, DoorBlock])],
  controllers: [BlocksController],
})
export class BlocksModule {}
