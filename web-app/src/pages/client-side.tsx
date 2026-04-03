import { useEffect, useState } from 'react';
import { HtmlHead } from '../pages-impl/html-head';
import type { PageProps } from 'gatsby';
import { TransportedDataGate } from '../ui/transported-data-gate';
import { CommunicationError } from '../communication-errors/communication-errors';
import {
  TransportedData,
  TransportedDataStatus,
} from '../communicated-data/communicated-data-types';

const Component = () => {
  const [entrypoint, replaceEntrypoint] = useState<
    TransportedData<
      typeof import('../pages-impl/client-side/client-side-template')
    >
  >({ status: TransportedDataStatus.NotInitialized });

  useEffect(() => {
    (async () => {
      replaceEntrypoint({
        status: TransportedDataStatus.Loading,
      });

      try {
        const ep = await import(
          '../pages-impl/client-side/client-side-template'
        );

        replaceEntrypoint({
          status: TransportedDataStatus.Done,
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
    <TransportedDataGate dataWrapper={entrypoint}>
      {({ data }) => {
        const ClientSideTemplate = data.ClientSideTemplate;

        return <ClientSideTemplate />;
      }}
    </TransportedDataGate>
  );
};

export default Component;

export function Head({ location }: PageProps) {
  return <HtmlHead location={location} title="Play" />;
}
