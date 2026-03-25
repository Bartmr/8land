import 'source-map-support/register';
import 'src/environment/load-environment-variables';

import { LoggingServiceSingleton } from './logging/logging.service.singleton';
import { NODE_ENV } from './environment/node-env.constants';
import { NodeEnv } from './environment/node-env.types';
import { ProcessType } from './process/process-context';
import { ProcessContextManager } from './process/process-context-manager';
import { generateRandomUUID } from './uuids/generate-random-uuid';
import { createApp } from './create-app';
import { EnvironmentVariablesService } from './environment/environment-variables.service';

type ModuleHotData = {
  closingPromise?: Promise<unknown>;
};

async function bootstrap() {
  ProcessContextManager.setContext({
    type: ProcessType.WebServer,
    name: ProcessType.WebServer,
    workerId: generateRandomUUID(),
  });

  const closingPromise = (module.hot?.data as ModuleHotData | undefined)
    ?.closingPromise;
  if (closingPromise) {
    await closingPromise;
  }

  const loggingService = LoggingServiceSingleton.makeInstance();

  if (NODE_ENV === NodeEnv.Development) {
    const { hotReloadDatabases } = await import(
      './databases/hot-reload-databases'
    );
    await hotReloadDatabases();
  }

  /*
    Some tools like nodemon use the SIGUSR2 signal
    to communicate a full restart

    We only need that signal when we are NOT using Hot Reload during development
  */
  const listenToSIGUSR2 = NODE_ENV === NodeEnv.Development && !module.hot;

  const app = await createApp();

  const shutdown = async () => {
    process.removeListener('SIGTERM', shutdownHandler);
    process.removeListener('SIGINT', shutdownHandler);
    if (listenToSIGUSR2) {
      process.removeListener('SIGUSR2', shutdownHandler);
    }

    const timeout = setTimeout(() => {
      // eslint-disable-next-line no-console
      console.error('\n\n !!! HANGING PROCESS !!! \n\n');
      process.exit(1);
    }, 30000);
    timeout.unref();

    process.on('exit', (code) => {
      // eslint-disable-next-line no-console
      console.info(`About to exit with code: ${code}`);
    });

    loggingService.logInfo('shutdown-triggered', 'Shutdown was triggered');

    await app.close();
  };

  const shutdownHandler = () => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    shutdown();
  };

  process.on('SIGTERM', shutdownHandler);
  process.on('SIGINT', shutdownHandler);
  if (listenToSIGUSR2) {
    process.on('SIGUSR2', shutdownHandler);
  }

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose((data: ModuleHotData) => {
      process.removeListener('SIGTERM', shutdownHandler);
      process.removeListener('SIGINT', shutdownHandler);
      if (listenToSIGUSR2) {
        process.removeListener('SIGUSR2', shutdownHandler);
      }

      loggingService.logInfo(
        'disposing-hmr',
        'Disposing previous hot reloaded instance',
      );

      data.closingPromise = app.close();
    });
  }

  await app.listen(EnvironmentVariablesService.variables.API_PORT);
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
