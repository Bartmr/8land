import React from 'react';
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import { ApiFetchErrors } from '../../api/fetch-errors';
import { AppContext } from '../client/index/screens/app/app-screen-types';
import { throwError } from '../../throw-error';

type AppContextState = {
  loading?: boolean;
  error?: ApiFetchErrors;
  data?: AppContext;
};

const AppContextContext = createContext<AppContextState | null>(null);

export function useAppContext() {
  const context = useContext(AppContextContext);

  return context || throwError();
}

export function AppContextProvider(props: { children: ReactNode }) {
  const [state, replaceState] = useState<AppContextState>({
    loading: true,
  });

  useEffect(() => {
    const listener = (e: MessageEvent) => {
      if (
        e.data &&
        typeof e.data === 'object' &&
        e.data.event === '8land:context'
      ) {
        window.removeEventListener('message', listener);

        replaceState({
          data: e.data.data,
        });
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
