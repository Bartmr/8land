import { useEffect, useState } from 'react';
import { TransportedDataGate } from 'src/components/shared/transported-data-gate/transported-data-gate';
import { TransportFailure } from 'src/logic/app-internals/transports/transported-data/transport-failures';
import {
  TransportedData,
  TransportedDataStatus,
} from 'src/logic/app-internals/transports/transported-data/transported-data-types';

const Component = () => {
  const [entrypoint, replaceEntrypoint] = useState<
    TransportedData<
      typeof import('../components/templates/client-side/client-side-template')
    >
  >({ status: TransportedDataStatus.NotInitialized });

  useEffect(() => {
    (async () => {
      replaceEntrypoint({
        status: TransportedDataStatus.Loading,
      });

      try {
        const ep = await import(
          '../components/templates/client-side/client-side-template'
        );

        replaceEntrypoint({
          status: TransportedDataStatus.Done,
          data: ep,
        });
      } catch (err) {
        const error = err as { name?: string };

        if (error.name === 'ChunkLoadError') {
          replaceEntrypoint({
            status: TransportFailure.ConnectionFailure,
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
