import { Module } from '@nestjs/common';
import { LoggingService } from 'src/logging/logging.service';
import { StorageModule } from 'src/storage/storage.module';
import { StorageService } from 'src/storage/storage.service';
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
