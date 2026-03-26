import { Module } from '@nestjs/common';
import { DoorBlock } from './door-block.entity';
import { Land } from 'src/land/land.entity';
import { BlocksController } from './blocks.controller';
import { AppBlock } from './app-block.entity';
import { TypeormFeatureModule } from 'src/databases/typeorm.module';

@Module({
  imports: [
    TypeormFeatureModule.forFeature({
      entities: [Land, DoorBlock, AppBlock],
    }),
  ],
  controllers: [BlocksController],
})
export class BlocksModule {}
