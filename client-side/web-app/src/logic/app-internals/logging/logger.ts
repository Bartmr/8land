/* eslint-disable no-console */
import { EnvironmentVariables } from '../runtime/environment-variables';
import { RUNNING_IN_CLIENT, RUNNING_IN_SERVER } from '../runtime/running-in';
import * as Sentry from '@sentry/react';

const LOG_ENTRIES_LIMIT = 3;

export const LOG_SERVICE_NAME = 'Sentry';
export const LOG_SERVICE_COMPANY = 'Functional Software, Inc.';

let sentryInstance: typeof Sentry | undefined;

if (RUNNING_IN_CLIENT && EnvironmentVariables.SENTRY_DSN) {
  sentryInstance = Sentry;
}

class LoggerImpl {
  private loggedErrors: { [key: string]: undefined | number } = {};
  private loggedWarnings: { [key: string]: undefined | number } = {};
  private loggedDebug: { [key: string]: undefined | number } = {};

  logDebug(key: string, extraData?: { [key: string]: unknown }) {
    if (EnvironmentVariables.LOG_DEBUG) {
      const numberOfTimesLogged = this.loggedDebug[key] || 0;

      if (
        EnvironmentVariables.DISABLE_LOGGING_LIMIT ||
        numberOfTimesLogged < LOG_ENTRIES_LIMIT
      ) {
        this.loggedDebug[key] = numberOfTimesLogged + 1;

        // TODO: Implement remote logging here

        /*
          Some remote loggers also capture console messages.
          Maybe it's best to just call either the remote logger or the console,
          and not both, so we don't get twice the events.
        */

        console.log('----- DEBUG: ' + key, '\nExtra data:', extraData);
      }
    }
  }

  logWarning(
    key: string,
    message: string,
    extraData?: { [key: string]: unknown },
  ) {
    const numberOfTimesLogged = this.loggedWarnings[key] || 0;

    if (
      EnvironmentVariables.DISABLE_LOGGING_LIMIT ||
      numberOfTimesLogged < LOG_ENTRIES_LIMIT
    ) {
      this.loggedWarnings[key] = numberOfTimesLogged + 1;

      // TODO: Implement remote logging here

      /*
        Some remote loggers also capture console messages.
        Maybe it's best to just call either the remote logger or the console,
        and not both, so we don't get twice the events.
      */

      if (sentryInstance) {
        Sentry.captureMessage(key, {
          level: 'warning',
          extra: {
            message,
            data: extraData,
          },
        });
      } else {
        console.warn('Logged warning with key: ' + key + '. ' + message);
        console.warn('Extra data:', extraData);
      }
    }
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

    const numberOfTimesLogged = this.loggedErrors[errorKey] || 0;

    if (
      EnvironmentVariables.DISABLE_LOGGING_LIMIT ||
      numberOfTimesLogged < LOG_ENTRIES_LIMIT
    ) {
      this.loggedErrors[errorKey] = numberOfTimesLogged + 1;

      // TODO: Implement remote logging here

      /*
        Some remote loggers also capture console messages.
        Maybe it's best to just call either the remote logger or the console,
        and not both, so we don't get twice the events.
      */

      if (sentryInstance) {
        Sentry.captureException(error, {
          extra: {
            key: errorKey,
            data: extraData,
            caughtValue: caughtValueIsInstanceOfError ? undefined : caughtValue,
          },
        });
      } else {
        this.logErrorToConsole(
          errorKey,
          caughtValue,
          error,
          caughtValueIsInstanceOfError,
          extraData,
        );
      }
    }
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
