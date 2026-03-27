import { Module } from '@nestjs/common';
import { AppBlock } from 'src/blocks/app-block.entity';
import { DoorBlock } from 'src/blocks/door-block.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StorageModule } from 'src/storage/storage.module';
import { TerritoriesEndUserController } from './territories.controller';
import { Territory } from './territory.entity';
import { AuthModule } from 'src/users/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Territory, DoorBlock, AppBlock]),
    StorageModule,
    AuthModule,
  ],
  controllers: [TerritoriesEndUserController],
})
export class TerritoriesModule {}
