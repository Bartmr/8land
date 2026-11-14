import React from 'react';
import { useEffect, useState } from 'react';
import { HtmlHead } from '../page-components/html-head/html-head';
import type { PageProps } from 'gatsby';
import { CommunicationError } from '../communication-errors/communication-errors';
import {
  CommunicatedData,
  CommunicatedDataStatus,
} from '../communicated-data/communicated-data-types';
import {
  FaExclamationCircle,
  FaLock,
  FaSearch,
  FaWifi,
} from 'react-icons/fa';

const Component = () => {
  const [entrypoint, replaceEntrypoint] = useState<
    CommunicatedData<
      typeof import('../page-components/client/client')
    >
  >({ status: CommunicatedDataStatus.NotInitialized });

  useEffect(() => {
    (async () => {
      replaceEntrypoint({
        status: CommunicatedDataStatus.Loading,
      });

      try {
        const ep = await import(
          '../page-components/client/client'
        );

        replaceEntrypoint({
          status: CommunicatedDataStatus.Done,
          data: ep,
        });
      } catch (err) {
        const error = err as { name?: string };

        if (error.name === 'ChunkLoadError') {
          replaceEntrypoint({
            status: CommunicationError.ConnectionFailure,
          });
        } else {
          throw error;
        }
      }
    })();
  }, []);

  return (
    <div className=" ">
      {entrypoint.status === CommunicatedDataStatus.NotInitialized ? null : entrypoint.status === CommunicatedDataStatus.Loading ? (
        <div className="d-flex flex-column justify-content-center align-items-center">
          <div
            className="d-block spinner-lg spinner-border text-primary"
            role="status"
          >
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : entrypoint.status === CommunicatedDataStatus.Refreshing ? (
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
      ) : entrypoint.status === CommunicationError.NotFound ? (
        <div className="d-flex flex-column justify-content-center align-items-center">
          <FaSearch style={{ fontSize: '2rem' }} />
          <p className="mt-3 text-center mb-0">Not Found</p>
        </div>
      ) : entrypoint.status === CommunicationError.ConnectionFailure ? (
        <div className="d-flex flex-column justify-content-center align-items-center">
          <FaWifi className="text-danger" style={{ fontSize: '2rem' }} />
          <p className="mt-3 text-center text-danger mb-0">
            No Internet. Check your connection and try again.
          </p>
        </div>
      ) : entrypoint.status === CommunicationError.Forbidden ? (
        <div className="d-flex flex-column justify-content-center align-items-center">
          <FaLock style={{ fontSize: '2rem' }} />
          <p className="mt-3 text-center mb-0">
            You are not allowed to access this content
          </p>
        </div>
      ) : entrypoint.status === CommunicationError.AbortedAndDealtWith ? (
        <div className="d-flex flex-column justify-content-center align-items-center">
          <p className="mt-3 text-center mb-0">Redirecting...</p>
        </div>
      ) : entrypoint.status === CommunicationError.UnexpectedResponse ? (
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
      {entrypoint.status === CommunicatedDataStatus.Done ||
      entrypoint.status === CommunicatedDataStatus.Refreshing ? (
        (() => {
          const Client = entrypoint.data.Client;

          return <Client />;
        })()
      ) : null}
    </div>
  );
};

export default Component;

export function Head({ location }: PageProps) {
  return <HtmlHead location={location} title="Play" />;
}
