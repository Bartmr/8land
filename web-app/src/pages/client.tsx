import React from 'react';
import { useEffect, useState } from 'react';
import { HtmlHead } from '../page-components/html-head/html-head';
import type { PageProps } from 'gatsby';
import { ApiFetchErrors } from '../api/fetch-errors';
import {
  FaExclamationCircle,
  FaWifi,
} from 'react-icons/fa';

const Component = () => {
  const [entrypoint, replaceEntrypoint] = useState<{
    loading?: boolean;
    error?: ApiFetchErrors;
    data?: typeof import('../page-components/client/client');
  }>({});

  useEffect(() => {
    (async () => {
      replaceEntrypoint({
        loading: true,
      });

      try {
        const ep = await import(
          '../page-components/client/client'
        );

        replaceEntrypoint({
          data: ep,
        });
      } catch (err) {
        const error = err as { name?: string };

        if (error.name === 'ChunkLoadError') {
          replaceEntrypoint({
            error: ApiFetchErrors.ConnectionFailure,
          });
        } else {
          throw error;
        }
      }
    })();
  }, []);

  return (
    <div className=" ">
      {entrypoint.loading ? (
        <div className="d-flex flex-column justify-content-center align-items-center">
          <div
            className="d-block spinner-lg spinner-border text-primary"
            role="status"
          >
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : null}
      {entrypoint.error === ApiFetchErrors.ConnectionFailure ? (
        <div className="d-flex flex-column justify-content-center align-items-center">
          <FaWifi className="text-danger" style={{ fontSize: '2rem' }} />
          <p className="mt-3 text-center text-danger mb-0">
            No Internet. Check your connection and try again.
          </p>
        </div>
      ) : entrypoint.error === ApiFetchErrors.AbortedAndDealtWith ? (
        <div className="d-flex flex-column justify-content-center align-items-center">
          <p className="mt-3 text-center mb-0">Redirecting...</p>
        </div>
      ) : entrypoint.error === ApiFetchErrors.UnexpectedResponse ? (
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
      {entrypoint.data !== undefined && !entrypoint.error ? (
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
