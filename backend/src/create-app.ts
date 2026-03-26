import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { EnvironmentVariablesService } from './environment/environment-variables.service';
import cookieParser from 'cookie-parser';

const WEB_APP_ORIGIN = EnvironmentVariablesService.variables.WEB_APP_ORIGIN;

export async function createApp() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  app.enableCors({
    origin: WEB_APP_ORIGIN,
    credentials: true,
  });

  return app;
}
