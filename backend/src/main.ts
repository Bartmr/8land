import 'source-map-support/register';

import dotenv from "dotenv";

dotenv.config();


async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  app.enableCors({
    origin: WEB_APP_ORIGIN,
    credentials: true,
  });


  const shutdown = async () => {
    app.close();
  }

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
  process.on('SIGUSR2', shutdown);

  await app.listen(EnvironmentVariablesService.variables.API_PORT);
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
