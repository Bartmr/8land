import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItselfModule } from 'src/internals/apis/itself/itself.module';
import { RaribleModule } from 'src/internals/apis/rarible/rarible.module';
import { StorageModule } from 'src/internals/storage/storage.module';
import { TerritoriesController } from './territories.controller';
import { TerritoriesEndUserController } from './territories.end-user.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([]),
    StorageModule,
    ItselfModule,
    RaribleModule,
  ],
  controllers: [TerritoriesController, TerritoriesEndUserController],
})
export class TerritoriesModule {}
