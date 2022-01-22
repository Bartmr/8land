import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlchemyModule } from 'src/internals/apis/alchemy/alchemy.module';
import { StorageModule } from 'src/internals/storage/storage.module';
import { TerritoriesController } from './territories.controller';

@Module({
  imports: [TypeOrmModule.forFeature([]), StorageModule, AlchemyModule],
  controllers: [TerritoriesController],
})
export class TerritoriesModule {}
