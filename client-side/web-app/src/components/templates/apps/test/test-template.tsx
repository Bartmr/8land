import { useEffect, useState } from 'react';
import { AppLayout } from 'src/components/routing/layout/app-layout';
import { TransportedDataGate } from 'src/components/shared/transported-data-gate/transported-data-gate';
import { AppContextProvider, useAppContext } from '../app-context';

function Content() {
  const appContext = useAppContext();
  const [eventData, replaceEventData] = useState<string | undefined>();

  useEffect(() => {
    window.addEventListener('message', (e) => {
      replaceEventData(e.data as string);
    });
  }, []);

  return (
    <>
      <TransportedDataGate dataWrapper={appContext}>
        {({ data }) => {
          return <pre>{JSON.stringify(data, undefined, 2)}</pre>;
        }}
      </TransportedDataGate>
      <div className="mt-3">Last Event: {eventData}</div>
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
