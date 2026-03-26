import { Module } from '@nestjs/common';
import { AppBlock } from 'src/blocks/app-block.entity';
import { DoorBlock } from 'src/blocks/door-block.entity';
import { BackendModule } from 'src/backend/backend.module';
import { RaribleModule } from 'src/rarible/rarible.module';
import { TypeormFeatureModule } from 'src/databases/typeorm.module';
import { StorageModule } from 'src/storage/storage.module';
import { TerritoriesEndUserController } from './territories.controller';
import { Territory } from './territory.entity';
import { AuthModule } from 'src/users/auth/auth.module';

@Module({
  imports: [
    TypeormFeatureModule.forFeature({
      entities: [Territory, DoorBlock, AppBlock],
    }),
    StorageModule,
    BackendModule,
    RaribleModule,
    AuthModule,
  ],
  controllers: [TerritoriesEndUserController],
})
export class TerritoriesModule {}
