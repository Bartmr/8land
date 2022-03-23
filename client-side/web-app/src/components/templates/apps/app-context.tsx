import { throwError } from '@app/shared/internals/utils/throw-error';
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import {
  TransportedData,
  TransportedDataStatus,
} from 'src/logic/app-internals/transports/transported-data/transported-data-types';
import { AppContext } from '../client-side/index/components/components/screens/app/app-screen.types';

const AppContextContext = createContext<TransportedData<AppContext> | null>(
  null,
);

export function useAppContext() {
  const context = useContext(AppContextContext);

  return context || throwError();
}

export function AppContextProvider(props: { children: ReactNode }) {
  const [state, replaceState] = useState<TransportedData<AppContext>>({
    status: TransportedDataStatus.Loading,
  });

  useEffect(() => {
    const interval = window.setInterval(() => {
      if (window.explore8Land) {
        window.clearInterval(interval);

        replaceState({
          status: TransportedDataStatus.Done,
          data: window.explore8Land,
        });
      }
    }, 300);
  }, []);

  return (
    <AppContextContext.Provider value={state}>
      {props.children}
    </AppContextContext.Provider>
  );
}
