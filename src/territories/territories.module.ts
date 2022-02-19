import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItselfModule } from 'src/internals/apis/itself/itself.module';
import { StorageModule } from 'src/internals/storage/storage.module';
import { TerritoriesController } from './territories.controller';
import { TerritoriesEndUserController } from './territories.end-user.controller';

@Module({
  imports: [TypeOrmModule.forFeature([]), StorageModule, ItselfModule],
  controllers: [TerritoriesController, TerritoriesEndUserController],
})
export class TerritoriesModule {}
