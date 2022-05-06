import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppBlock } from 'src/blocks/typeorm/app-block.entity';
import { DoorBlock } from 'src/blocks/typeorm/door-block.entity';
import { ItselfModule } from 'src/internals/apis/itself/itself.module';
import { RaribleModule } from 'src/internals/apis/rarible/rarible.module';
import { StorageModule } from 'src/internals/storage/storage.module';
import { TerritoriesEndUserController } from './territories.controller';
import { Territory } from './typeorm/territory.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Territory, DoorBlock, AppBlock]),
    StorageModule,
    ItselfModule,
    RaribleModule,
  ],
  controllers: [TerritoriesEndUserController],
})
export class TerritoriesModule {}
