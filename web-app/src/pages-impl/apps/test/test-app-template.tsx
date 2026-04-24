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

      window.addEventListener('message', (e) => {
        if (
          [
            '8land:gamepad:direction:up',
            '8land:gamepad:direction:down',
            '8land:gamepad:direction:left',
            '8land:gamepad:direction:right',
            '8land:gamepad:direction:none',

            '8land:gamepad:a:pressed',
            '8land:gamepad:a:released',

            '8land:gamepad:b:pressed',
            '8land:gamepad:b:released',
          ].includes(e.data)
        ) {
          const trimmed = e.data.replace('8land:gamepad:', '');

          replaceEventData(trimmed);
        }
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
          window.parent.postMessage('8land:music:stop', '*');
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
