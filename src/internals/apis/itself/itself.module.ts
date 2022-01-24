import { Module } from '@nestjs/common';
import { ItselfStorageApi } from './itself-storage.api';

@Module({
  providers: [ItselfStorageApi],
  exports: [ItselfStorageApi],
})
export class ItselfModule {}
