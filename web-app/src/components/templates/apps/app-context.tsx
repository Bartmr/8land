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

const AppContextContext = createContext<TransportedData<
  AppContext & { explore8Land: NonNullable<Window['explore8Land']> }
> | null>(null);

export function useAppContext() {
  const context = useContext(AppContextContext);

  return context || throwError();
}

export function AppContextProvider(props: { children: ReactNode }) {
  const [state, replaceState] = useState<
    TransportedData<
      AppContext & { explore8Land: NonNullable<Window['explore8Land']> }
    >
  >({
    status: TransportedDataStatus.Loading,
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
          status: TransportedDataStatus.Done,
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
