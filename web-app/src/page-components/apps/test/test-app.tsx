import React from 'react';
import { useEffect, useState } from 'react';
import { AppLayout } from '../app-layout';
import { CommunicatedDataStatus } from '../../../communicated-data/communicated-data-types';
import { CommunicationError } from '../../../communication-errors/communication-errors';
import {
  FaExclamationCircle,
  FaLock,
  FaSearch,
  FaWifi,
} from 'react-icons/fa';
import { AppContextProvider, useAppContext } from '../app-context';

function Content() {
  const appContext = useAppContext();
  const [eventData, replaceEventData] = useState<string | undefined>();

  useEffect(() => {
    if (appContext.status === CommunicatedDataStatus.Done) {

      window.addEventListener('message', (e) => {
        if (
          [
            '8land:keypad:direction:up',
            '8land:keypad:direction:down',
            '8land:keypad:direction:left',
            '8land:keypad:direction:right',
            '8land:keypad:direction:none',

            '8land:keypad:a:pressed',
            '8land:keypad:a:released',

            '8land:keypad:b:pressed',
            '8land:keypad:b:released',
          ].includes(e.data)
        ) {
          const trimmed = e.data.replace('8land:keypad:', '');

          replaceEventData(trimmed);
        }
      });

    }
  }, [appContext]);

  return (
    <>
      <div className=" ">
        {appContext.status === CommunicatedDataStatus.NotInitialized ? null : appContext.status === CommunicatedDataStatus.Loading ? (
          <div className="d-flex flex-column justify-content-center align-items-center">
            <div
              className="d-block spinner-lg spinner-border text-primary"
              role="status"
            >
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : appContext.status === CommunicatedDataStatus.Refreshing ? (
          <div
            style={{
              zIndex: 1,
              right: 'var(--spacer-3)',
              position: 'fixed',
            }}
          >
            <div
              className="d-block spinner-lg spinner-border text-primary"
              role="status"
            >
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : appContext.status === CommunicationError.NotFound ? (
          <div className="d-flex flex-column justify-content-center align-items-center">
            <FaSearch style={{ fontSize: '2rem' }} />
            <p className="mt-3 text-center mb-0">Not Found</p>
          </div>
        ) : appContext.status === CommunicationError.ConnectionFailure ? (
          <div className="d-flex flex-column justify-content-center align-items-center">
            <FaWifi className="text-danger" style={{ fontSize: '2rem' }} />
            <p className="mt-3 text-center text-danger mb-0">
              No Internet. Check your connection and try again.
            </p>
          </div>
        ) : appContext.status === CommunicationError.Forbidden ? (
          <div className="d-flex flex-column justify-content-center align-items-center">
            <FaLock style={{ fontSize: '2rem' }} />
            <p className="mt-3 text-center mb-0">
              You are not allowed to access this content
            </p>
          </div>
        ) : appContext.status === CommunicationError.AbortedAndDealtWith ? (
          <div className="d-flex flex-column justify-content-center align-items-center">
            <p className="mt-3 text-center mb-0">Redirecting...</p>
          </div>
        ) : appContext.status === CommunicationError.UnexpectedResponse ? (
          <div className="d-flex flex-column justify-content-center align-items-center">
            <FaExclamationCircle
              className="text-danger"
              style={{ fontSize: '2rem' }}
            />
            <p className="text-danger mt-3 text-center mb-0">
              An unexpected error occurred. Try again later.
            </p>
          </div>
        ) : null}
        {appContext.status === CommunicatedDataStatus.Done ||
        appContext.status === CommunicatedDataStatus.Refreshing ? (
          <pre>{JSON.stringify(appContext.data, undefined, 2)}</pre>
        ) : null}
      </div>
      <div className="mt-3">Last Event: {eventData}</div>
      <button
        className="mt-3"
        onClick={() => {
          window.parent.postMessage('8land:music:stop', '*');
        }}
      >
        Stop music
      </button>
    </>
  );
}

export function TestApp() {
  return (
    <AppLayout>
      {() => {
        return (
          <AppContextProvider>
            <Content />
          </AppContextProvider>
        );
      }}
    </AppLayout>
  );
}
