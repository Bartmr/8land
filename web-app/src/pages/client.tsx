import React from 'react';
import { useEffect, useState } from 'react';
import { HtmlHead } from '../page-components/html-head/html-head';
import type { PageProps } from 'gatsby';
import { CommunicatedDataGate } from '../ui/communicated-data-gate';
import { CommunicationError } from '../communication-errors/communication-errors';
import {
  CommunicatedData,
  CommunicatedDataStatus,
} from '../communicated-data/communicated-data-types';

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
    <CommunicatedDataGate dataWrapper={entrypoint}>
      {({ data }) => {
        const Client = data.Client;

        return <Client />;
      }}
    </CommunicatedDataGate>
  );
};

export default Component;

export function Head({ location }: PageProps) {
  return <HtmlHead location={location} title="Play" />;
}
