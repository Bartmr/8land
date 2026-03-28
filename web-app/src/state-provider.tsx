import React, { ReactNode, useEffect, useState } from 'react';
// eslint-disable-next-line node/no-restricted-import
import { Provider } from 'react-redux';
import {
  createStoreManager,
  StoreManagerProvider,
} from 'src/store/store-manager';
import { useMainApiSession } from 'src/main-api/session/use-main-api-session';
import { useStoreSelector } from 'src/store/use-store-selector';
import { TransportedDataStatus } from 'src/transported-data/transported-data-types';
import { mainApiReducer } from 'src/main-api/main-api-reducer';
import { RUNNING_IN_CLIENT } from 'src/runtime';
import { useStoreDispatch } from 'src/store/use-store-dispatch';
import { navigate } from 'gatsby';
import { LOGIN_ROUTE } from 'src/pages-impl/client-side/login/login-routes';
import { SSRProvider } from 'react-bootstrap';

let previousRuntimeData:
  | undefined
  | {
      storeManager: ReturnType<typeof createStoreManager>;
    };
type ModuleHotData = {
  storeManager: ReturnType<typeof createStoreManager>;
};

const FrameWithState = (props: { children: ReactNode }) => {
  const dispatch = useStoreDispatch({ mainApi: mainApiReducer });

  const mainApiSession = useMainApiSession();

  const mainApiState = useStoreSelector(
    { mainApi: mainApiReducer },
    (s) => s.mainApi,
  );

  useEffect(() => {
    (async () => {
      if (
        mainApiState.session.status === TransportedDataStatus.NotInitialized
      ) {
        if (mainApiState.isLoggingOut) {
          await navigate(LOGIN_ROUTE.getHref({ next: null }));

          dispatch({
            type: 'FINISHED_LOGGING_OUT',
          });
        }

        await mainApiSession.restoreSession();
      }
    })();
  }, [mainApiState.session.status]);

  return <SSRProvider>{props.children}</SSRProvider>;
};

export function StateProvider(props: { children: ReactNode }) {
  const [storeManager] = useState(() => {
    const storeManagerFromPreviousRuntime = module.hot
      ? previousRuntimeData?.storeManager ||
        (module.hot.data as ModuleHotData | undefined)?.storeManager
      : undefined;

    const storeManagerForCurrentRuntime =
      storeManagerFromPreviousRuntime || createStoreManager();

    if (module.hot && RUNNING_IN_CLIENT) {
      previousRuntimeData = {
        storeManager: storeManagerForCurrentRuntime,
      };

      module.hot.dispose((data: ModuleHotData) => {
        data.storeManager = storeManagerForCurrentRuntime;
      });
    }

    return storeManagerForCurrentRuntime;
  });

  return (
    <StoreManagerProvider storeManager={storeManager}>
      <Provider store={storeManager.store}>
        <FrameWithState>{props.children}</FrameWithState>
      </Provider>
    </StoreManagerProvider>
  );
}
