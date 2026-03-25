import { Module } from '@nestjs/common';
import { DoorBlock } from './typeorm/door-block.entity';
import { Land } from 'src/land/typeorm/land.entity';
import { BlocksController } from './blocks.controller';
import { AppBlock } from './typeorm/app-block.entity';
import { TypeormFeatureModule } from 'src/internals/databases/typeorm.module';

@Module({
  imports: [
    TypeormFeatureModule.forFeature({
      entities: [Land, DoorBlock, AppBlock],
    }),
  ],
  controllers: [BlocksController],
})
export class BlocksModule {}
