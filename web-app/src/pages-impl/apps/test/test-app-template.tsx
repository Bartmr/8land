import React from 'react';
import { useEffect, useState } from 'react';
import { AppLayout } from '../../layout/app-layout';
import { CommunicatedDataGate } from '../../../ui/communicated-data-gate';
import { CommunicatedDataStatus } from '../../../communicated-data/communicated-data-types';
import { AppContextProvider, useAppContext } from '../app-context';

function Content() {
  const appContext = useAppContext();
  const [eventData, replaceEventData] = useState<string | undefined>();

  useEffect(() => {
    if (appContext.status === CommunicatedDataStatus.Done) {
      const explore8Land = appContext.data.explore8Land;

      explore8Land.listenToGamepad((e) => {
        replaceEventData(e);
      });
    }
  }, [appContext]);

  return (
    <>
      <CommunicatedDataGate dataWrapper={appContext}>
        {({ data }) => {
          return <pre>{JSON.stringify(data, undefined, 2)}</pre>;
        }}
      </CommunicatedDataGate>
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
