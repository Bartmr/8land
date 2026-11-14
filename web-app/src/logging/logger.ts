/* eslint-disable no-console */
import { useMemo } from 'react';
import { EnvironmentVariables } from '../environment-variables';
import { RUNNING_IN_SERVER } from '../runtime';


export class Logger {

  logDebug(message: string, context?: { [key: string]: unknown }) {
    if (EnvironmentVariables.LOG_DEBUG) {
      console.log('----- DEBUG: ' + message, '\nExtra data:', context);
    }
  }

  logWarning(
    message: string,
    context?: { [key: string]: unknown },
  ) {


      // TODO: Implement remote logging here

      console.warn('Logged warning with message: ' + message);
      console.warn('Extra data:', context);
  }

  logError(
    message: string,
    context?: { [key: string]: unknown },
  ) {


      // TODO: Implement remote logging here

      console.error('Logged warning with message: ' + message);
      console.error('Extra data:', context);
  }

  logException(
    message: string,
    /*
      In Javascript, any value type can be thrown,
      so we don't know if a caught value is actually an Error instance.
    */
    caughtValue: unknown,
    context?: { [key: string]: unknown },
  ) {
    

    // Stop building pages if one of them has an error
    if (RUNNING_IN_SERVER) {
      this.logExceptionToConsole(
        message,
        caughtValue,
        context,
      );

      throw caughtValue;
    }


    // TODO: Implement remote logging here

    /*
      Some remote loggers also capture console messages.
      Maybe it's best to just call either the remote logger or the console,
      and not both, so we don't get twice the events.
    */
    this.logExceptionToConsole(
      message,
      caughtValue,
      context,
    );
  }

  private logExceptionToConsole(
    errorKey: string,
    caughtValue: unknown,
    context: unknown,
  ) {
    const caughtValueIsInstanceOfError = caughtValue instanceof Error;
    const error = caughtValueIsInstanceOfError ? caughtValue : new Error();

    console.error('Logged error with key: ' + errorKey);

    if (!caughtValueIsInstanceOfError) {
      console.error('Caught value is not an instance of Error:', caughtValue);
    }

    console.error(error);

    if (typeof context !== 'undefined') {
      console.error('Error extra data:', context);
    }
  }
}

export function useLogger() {
  return useMemo(() => new Logger(), []);
}
