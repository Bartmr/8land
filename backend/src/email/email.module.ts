import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { NODE_ENV } from '../environment/node-env.constants';
import { NodeEnv } from '../environment/node-env.types';
import { DevEmailService } from './dev-email.service';
import { EmailService } from './email.service';
import express from 'express';
import path from 'path';
import { LOCAL_TEMPORARY_FILES_PATH } from '../temporary-files/temporary-files';
import fs from 'fs';
import { promisify } from 'util';
import { EnvironmentVariables } from 'src/environment/environment-variables';
import { throwError } from '../../../shared/src/throw-error';

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
