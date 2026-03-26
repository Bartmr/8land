import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LoggingService } from './logging/logging.service';
import { LoggerService } from '@nestjs/common';
import { NODE_ENV } from './environment/node-env.constants';
import { NodeEnv } from './environment/node-env.types';
import { EnvironmentVariablesService } from './environment/environment-variables.service';
import { PROJECT_NAME } from '@shared/src/project-details';
import cookieParser from 'cookie-parser';

const WEB_APP_ORIGIN = EnvironmentVariablesService.variables.WEB_APP_ORIGIN;

export async function createApp() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  app.enableCors({
    origin: WEB_APP_ORIGIN,
    credentials: true,
  });

  const loggingService = app.get(LoggingService);

  const logger: LoggerService = {
    log(message: string) {
      loggingService.logInfo('nestjs-logger-log', message);
    },
    error(message: string, trace: string) {
      loggingService.logError('nestjs-logger-error', new Error(), {
        message,
        trace,
      });
    },
    warn(message: string) {
      loggingService.logWarning('nestjs-logger-warn', message);
    },
    debug(message: string) {
      loggingService.logDebug('nestjs-logger-debug', message);
    },
    verbose(message: string) {
      loggingService.logInfo('nestjs-logger-verbose', message);
    },
  };

  app.useLogger(logger);

  return app;
}
