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
  AppContext
> | null>(null);

export function useAppContext() {
  const context = useContext(AppContextContext);

  return context || throwError();
}

export function AppContextProvider(props: { children: ReactNode }) {
  const [state, replaceState] = useState<
    CommunicatedData<
      AppContext 
    >
  >({
    status: CommunicatedDataStatus.Loading,
  });

  useEffect(() => {
    const listener = (e: MessageEvent) => {
      if (
        e.data &&
        typeof e.data === 'object' &&
        e.data.event === '8land:context'
      ) {
        window.removeEventListener('message', listener);
      }
    };

    window.addEventListener('message', listener);

    window.parent.postMessage('8land:context:get', '*');
  }, []);

  return (
    <>
      <AppContextContext.Provider value={state}>
        {props.children}
      </AppContextContext.Provider>
    </>
  );
}
