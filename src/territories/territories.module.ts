import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StorageModule } from 'src/internals/storage/storage.module';
import { TerritoriesController } from './territories.controller';

@Module({
  imports: [TypeOrmModule.forFeature([]), StorageModule],
  controllers: [TerritoriesController],
})
export class TerritoriesModule {}
