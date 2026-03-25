import { Module } from '@nestjs/common';
import { LoggingService } from 'src/internals/logging/logging.service';
import { StorageModule } from 'src/internals/storage/storage.module';
import { StorageService } from 'src/internals/storage/storage.service';
import { BackendStorageApi } from './backend-storage.api';

@Module({
  imports: [StorageModule],
  providers: [
    {
      provide: BackendStorageApi,
      inject: [LoggingService, StorageService],
      useFactory: (
        loggingService: LoggingService,
        storageService: StorageService,
      ) => {
        return new BackendStorageApi(
          loggingService,
          storageService.getHostUrl(),
        );
      },
    },
  ],
  exports: [BackendStorageApi],
})
export class BackendModule {}
