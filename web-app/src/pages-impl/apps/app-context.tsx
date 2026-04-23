import React from 'react';
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import {
  CommunicatedData,
  CommunicatedDataStatus,
} from '../../communicated-data/communicated-data-types';
import { AppContext } from '../client/index/screens/app/app-screen.types';
import { throwError } from '../../throw-error';

const AppContextContext = createContext<CommunicatedData<
  AppContext & { explore8Land: NonNullable<Window['explore8Land']> }
> | null>(null);

export function useAppContext() {
  const context = useContext(AppContextContext);

  return context || throwError();
}

export function AppContextProvider(props: { children: ReactNode }) {
  const [state, replaceState] = useState<
    CommunicatedData<
      AppContext & { explore8Land: NonNullable<Window['explore8Land']> }
    >
  >({
    status: CommunicatedDataStatus.Loading,
  });

  useEffect(() => {
    const script = document.createElement('script');

    script.src = '/app-plugin.js';

    document.body.appendChild(script);

    const interval = window.setInterval(async () => {
      if (window.explore8Land) {
        window.clearInterval(interval);

        const context = await window.explore8Land.getContext();

        replaceState({
          status: CommunicatedDataStatus.Done,
          data: { ...context, explore8Land: window.explore8Land },
        });
      }
    }, 500);
  }, []);

  return (
    <>
      <AppContextContext.Provider value={state}>
        {props.children}
      </AppContextContext.Provider>
    </>
  );
}
