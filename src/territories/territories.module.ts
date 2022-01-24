import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MoralisModule } from 'src/internals/smart-contracts/moralis/moralis.module';
import { StorageModule } from 'src/internals/storage/storage.module';
import { TerritoriesController } from './territories.controller';

@Module({
  imports: [TypeOrmModule.forFeature([]), StorageModule, MoralisModule],
  controllers: [TerritoriesController],
})
export class TerritoriesModule {}
