import { Module } from '@nestjs/common';
import { AppBlock } from 'src/blocks/typeorm/app-block.entity';
import { DoorBlock } from 'src/blocks/typeorm/door-block.entity';
import { BackendModule } from 'src/internals/backend/backend.module';
import { RaribleModule } from 'src/internals/rarible/rarible.module';
import { TypeormFeatureModule } from 'src/internals/databases/typeorm.module';
import { StorageModule } from 'src/internals/storage/storage.module';
import { TerritoriesEndUserController } from './territories.controller';
import { Territory } from './typeorm/territory.entity';

@Module({
  imports: [
    TypeormFeatureModule.forFeature({
      entities: [Territory, DoorBlock, AppBlock],
    }),
    StorageModule,
    BackendModule,
    RaribleModule,
  ],
  controllers: [TerritoriesEndUserController],
})
export class TerritoriesModule {}
