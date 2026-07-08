import React from 'react';
import { useEffect, useState } from 'react';
import { AppLayout } from '../../layout/app-layout';
import { CommunicatedDataGate } from '../../../core/ui/communicated-data-gate';
import { CommunicatedDataStatus } from '../../../core/communicated-data/communicated-data-types';
import { AppContextProvider, useAppContext } from '../app-context';

function Content() {
  const appContext = useAppContext();
  const [eventData, replaceEventData] = useState<string | undefined>();

  useEffect(() => {
    if (appContext.status === CommunicatedDataStatus.Done) {

      window.addEventListener('message', (e) => {
        if (
          [
            '8land:keypad:direction:up',
            '8land:keypad:direction:down',
            '8land:keypad:direction:left',
            '8land:keypad:direction:right',
            '8land:keypad:direction:none',

            '8land:keypad:a:pressed',
            '8land:keypad:a:released',

            '8land:keypad:b:pressed',
            '8land:keypad:b:released',
          ].includes(e.data)
        ) {
          const trimmed = e.data.replace('8land:keypad:', '');

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
