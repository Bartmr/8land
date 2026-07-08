/* eslint-disable no-console */
import { EnvironmentVariables } from '../environment-variables';
import { RUNNING_IN_SERVER } from '../runtime';


export const LOG_SERVICE_NAME = 'Sentry';
export const LOG_SERVICE_COMPANY = 'Functional Software, Inc.';


class LoggerImpl {

  logDebug(key: string, extraData?: { [key: string]: unknown }) {
    if (EnvironmentVariables.LOG_DEBUG) {
      console.log('----- DEBUG: ' + key, '\nExtra data:', extraData);
    }
  }

  logWarning(
    key: string,
    message: string,
    extraData?: { [key: string]: unknown },
  ) {


      // TODO: Implement remote logging here

      console.warn('Logged warning with key: ' + key + '. ' + message);
      console.warn('Extra data:', extraData);
  }

  logError(
    errorKey: string,
    /*
      In Javascript, any value type can be thrown,
      so we don't know if a caught value is actually an Error instance.
    */
    caughtValue: unknown,
    extraData?: { [key: string]: unknown },
  ) {
    const caughtValueIsInstanceOfError = caughtValue instanceof Error;
    const error = caughtValueIsInstanceOfError ? caughtValue : new Error();

    // Stop building pages if one of them has an error
    if (RUNNING_IN_SERVER) {
      this.logErrorToConsole(
        errorKey,
        caughtValue,
        error,
        caughtValueIsInstanceOfError,
        extraData,
      );

      throw caughtValue;
    }


    // TODO: Implement remote logging here

    /*
      Some remote loggers also capture console messages.
      Maybe it's best to just call either the remote logger or the console,
      and not both, so we don't get twice the events.
    */


    this.logErrorToConsole(
      errorKey,
      caughtValue,
      error,
      caughtValueIsInstanceOfError,
      extraData,
    );
  }

  private logErrorToConsole(
    errorKey: string,
    caughtValue: unknown,
    error: unknown,
    caughtValueIsInstanceOfError: boolean,
    extraData: unknown,
  ) {
    console.error('Logged error with key: ' + errorKey);

    if (!caughtValueIsInstanceOfError) {
      console.error('Caught value is not an instance of Error:', caughtValue);
    }

    console.error(error);

    if (typeof extraData !== 'undefined') {
      console.error('Error extra data:', extraData);
    }
  }
}

const Logger = new LoggerImpl();

export { Logger };

export function useLogger() {
  return Logger;
}
