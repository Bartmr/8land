import 'source-map-support/register';

import dotenv from "dotenv";
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { EnvironmentVariables } from './environment/environment-variables';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  app.enableCors({
    origin: EnvironmentVariables.WEB_APP_ORIGIN,
    credentials: true,
  });


  const shutdown = async () => {
    app.close();
  }

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
  process.on('SIGUSR2', shutdown);

  await app.listen(EnvironmentVariables.API_PORT, "0.0.0.0");
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
