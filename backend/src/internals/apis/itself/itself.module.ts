import { Module } from '@nestjs/common';
import { LoggingService } from 'src/internals/logging/logging.service';
import { StorageModule } from 'src/internals/storage/storage.module';
import { StorageService } from 'src/internals/storage/storage.service';
import { ItselfStorageApi } from './itself-storage.api';

@Module({
  imports: [StorageModule],
  providers: [
    {
      provide: ItselfStorageApi,
      inject: [LoggingService, StorageService],
      useFactory: (
        loggingService: LoggingService,
        storageService: StorageService,
      ) => {
        return new ItselfStorageApi(
          loggingService,
          storageService.getHostUrl(),
        );
      },
    },
  ],
  exports: [ItselfStorageApi],
})
export class ItselfModule {}
