import { MiddlewareConsumer, Module } from '@nestjs/common';
import { LOCAL_TEMPORARY_FILES_PATH } from '../local-temporary-files/local-temporary-files-path';
import express from 'express';
import path from 'path';
import { StorageService } from './storage.service';
import { DevStorageService } from './dev-storage.service';
import { throwError } from 'libs/shared/src/internals/utils/throw-error';
import fs from 'fs';
import { promisify } from 'util';
import { EnvironmentVariablesService } from '../environment/environment-variables.service';
import { ProdStorageService } from './prod-storage.service';
import { S3Client } from '@aws-sdk/client-s3';

const mkdir = promisify(fs.mkdir);

export const USE_DEV_STORAGE =
  !EnvironmentVariablesService.variables.AWS_ENDPOINT;

@Module({
  providers: [
    {
      provide: StorageService,
      useFactory: () => {
        if (USE_DEV_STORAGE) {
          return new DevStorageService();
        } else {
          const s3Client = new S3Client({
            endpoint: `https://${
              EnvironmentVariablesService.variables.AWS_ENDPOINT || throwError()
            }`,
            region:
              EnvironmentVariablesService.variables.AWS_REGION || throwError(),
            credentials: {
              accessKeyId:
                EnvironmentVariablesService.variables.AWS_ACCESS_KEY_ID ||
                throwError(),
              secretAccessKey:
                EnvironmentVariablesService.variables.AWS_SECRET_ACCESS_KEY ||
                throwError(),
            },
          });

          return new ProdStorageService(s3Client);
        }
      },
    },
  ],
  exports: [StorageService],
})
export class StorageModule {
  async configure(consumer: MiddlewareConsumer) {
    if (USE_DEV_STORAGE) {
      await mkdir(path.join(LOCAL_TEMPORARY_FILES_PATH, 'storage'), {
        recursive: true,
      });

      consumer
        .apply(
          express.static(path.join(LOCAL_TEMPORARY_FILES_PATH, 'storage'), {
            setHeaders: (res) => {
              res.setHeader('Content-Disposition', 'attachment');
              res.setHeader('Cache-Control', 'no-cache');
            },
          }),
        )
        .forRoutes('/tmp/storage');
    }
  }
}
