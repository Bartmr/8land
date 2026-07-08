import React from 'react';
import { useEffect, useState } from 'react';
import { HtmlHead } from '../pages-impl/html-head/html-head';
import type { PageProps } from 'gatsby';
import { CommunicatedDataGate } from '../core/ui/communicated-data-gate';
import { CommunicationError } from '../core/communication-errors/communication-errors';
import {
  CommunicatedData,
  CommunicatedDataStatus,
} from '../core/communicated-data/communicated-data-types';

const Component = () => {
  const [entrypoint, replaceEntrypoint] = useState<
    CommunicatedData<
      typeof import('../pages-impl/client/client-template')
    >
  >({ status: CommunicatedDataStatus.NotInitialized });

  useEffect(() => {
    (async () => {
      replaceEntrypoint({
        status: CommunicatedDataStatus.Loading,
      });

      try {
        const ep = await import(
          '../pages-impl/client/client-template'
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
        const ClientSideTemplate = data.ClientTemplate;

        return <ClientSideTemplate />;
      }}
    </CommunicatedDataGate>
  );
};

export default Component;

export function Head({ location }: PageProps) {
  return <HtmlHead location={location} title="Play" />;
}
