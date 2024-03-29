import React, { ReactNode, useEffect, useState } from 'react';
import { Logger } from 'src/logic/app-internals/logging/logger';
import { EnvironmentVariables } from 'src/logic/app-internals/runtime/environment-variables';
import { faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { StateProvider } from './components/state-provider';
import { Helmet } from 'react-helmet';
import { dom } from '@fortawesome/fontawesome-svg-core';
import { USER_ROUTE } from '../templates/client-side/user/user-routes';

const FatalErrorFrame = () => {
  return (
    <div className="vh-100 bg-body">
      <div className="h-75 container d-flex flex-column justify-content-center">
        <div className="text-center">
          <FontAwesomeIcon
            className={`icon-thumbnail mb-4`}
            icon={faExclamationCircle}
          />
          <h2>Internal Error</h2>
          <p className="lead">
            An internal error occured.
            <br />
            Please refresh the page and try again.
          </p>
          <p>
            {
              "If you're stuck in a land and can't get out, try to use the Escape button "
            }
            <a
              href={USER_ROUTE.getHref({ section: 'escape' })}
              onClick={(e) => {
                e.preventDefault();
                window.location.assign(
                  USER_ROUTE.getHref({ section: 'escape' }),
                );
              }}
            >
              here
            </a>
            {'. It will teleport you back to a safe location.'}
          </p>
        </div>
      </div>
    </div>
  );
};

type ErrorBoundaryProps = { children: ReactNode };
type ErrorBoundaryState = { fatalErrorOccurred: boolean };
class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { fatalErrorOccurred: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { fatalErrorOccurred: true };
  }

  componentDidCatch(error: unknown, errorInfo: unknown) {
    Logger.logError('root-frame-error-boundary', error, { errorInfo });
  }

  render() {
    if (this.state.fatalErrorOccurred) {
      return <FatalErrorFrame />;
    }

    return <>{this.props.children}</>;
  }
}

export const UncaughtErrorHandler = (props: { children: ReactNode }) => {
  const [fatalErrorOccurred, replaceFatalErrorOccurredFlag] = useState(false);

  useEffect(() => {
    /*
      The logger module is already logging these exceptions.
      It attaches listeners in its initialization.

      These listeners here are just for showing a warning to the user
    */
    const unhandledPromiseRejectionHandler = () => {
      replaceFatalErrorOccurredFlag(true);
    };

    const uncaughtExceptionHandler = () => {
      replaceFatalErrorOccurredFlag(true);
    };

    window.addEventListener(
      'unhandledrejection',
      unhandledPromiseRejectionHandler,
    );
    window.addEventListener('error', uncaughtExceptionHandler);

    return () => {
      window.removeEventListener(
        'unhandledrejection',
        unhandledPromiseRejectionHandler,
      );
      window.removeEventListener('error', uncaughtExceptionHandler);
    };
  }, []);

  if (EnvironmentVariables.DISABLE_ERROR_BOUNDARIES) {
    return <StateProvider>{props.children}</StateProvider>;
  } else {
    if (fatalErrorOccurred) {
      return <FatalErrorFrame />;
    } else {
      return (
        <ErrorBoundary>
          <StateProvider>{props.children}</StateProvider>
        </ErrorBoundary>
      );
    }
  }
};

export const _RootFrameImpl = (props: { children: ReactNode }) => {
  return (
    <>
      <Helmet>
        <style>{dom.css()}</style>
      </Helmet>
      <UncaughtErrorHandler>{props.children}</UncaughtErrorHandler>
    </>
  );
};
