import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import express from 'express';
import path from 'path';
import { LOCAL_TEMPORARY_FILES_PATH } from '../temporary-files/temporary-files';
import fs from 'fs';
import { promisify } from 'util';
import { EnvironmentVariables } from 'src/environment-variables/environment-variables';
import { EmailService } from './email.service';
import { DevEmailService } from './dev-email.service';
import { throwError } from 'src/throw-error';

const mkdir = promisify(fs.mkdir);

@Module({
  providers: [
    {
      provide: EmailService,
      useClass: EnvironmentVariables.USE_DEV_EMAIL ? DevEmailService : throwError(),
    },
  ],
  exports: [EmailService],
})
export class EmailModule implements NestModule {
  async configure(consumer: MiddlewareConsumer) {
    if (EnvironmentVariables.USE_DEV_EMAIL) {
      await mkdir(path.join(LOCAL_TEMPORARY_FILES_PATH, 'dev-email'), {
        recursive: true,
      });

      consumer
        .apply(
          express.static(path.join(LOCAL_TEMPORARY_FILES_PATH, 'dev-email')),
        )
        .forRoutes('/tmp/dev-email');
    }
  }
}
