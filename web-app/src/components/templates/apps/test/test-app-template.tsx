import { useEffect, useState } from 'react';
import { AppLayout } from 'src/components/routing/layout/app-layout';
import { TransportedDataGate } from 'src/components/shared/transported-data-gate/transported-data-gate';
import { TransportedDataStatus } from 'src/logic/app-internals/transports/transported-data/transported-data-types';
import { AppContextProvider, useAppContext } from '../app-context';

function Content() {
  const appContext = useAppContext();
  const [eventData, replaceEventData] = useState<string | undefined>();

  useEffect(() => {
    if (appContext.status === TransportedDataStatus.Done) {
      const explore8Land = appContext.data.explore8Land;

      explore8Land.listenToGamepad((e) => {
        replaceEventData(e);
      });
    }
  }, [appContext]);

  return (
    <>
      <TransportedDataGate dataWrapper={appContext}>
        {({ data }) => {
          return <pre>{JSON.stringify(data, undefined, 2)}</pre>;
        }}
      </TransportedDataGate>
      <div className="mt-3">Last Event: {eventData}</div>
      <button
        className="mt-3"
        onClick={() => {
          appContext.data?.explore8Land.stopMusic();
        }}
      >
        Stop music
      </button>
    </>
  );
}

export function TestAppTemplate() {
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
