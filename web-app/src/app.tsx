import './logging/logger';
import './environment-variables';
import 'src/ui/bootstrap/index.scss';
import 'src/ui/icons.scss';

import React, { ReactNode, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { dom } from '@fortawesome/fontawesome-svg-core';
import { SSRProvider } from 'react-bootstrap';
import { createStoreManager, StoreManagerProvider } from './redux/store-manager';
import { RUNNING_IN_CLIENT } from './runtime';
import { Provider } from 'react-redux';
import { useStoreDispatch } from './redux/use-store-dispatch';
import { useUserAuth } from './users/auth/use-user-auth';
import { useStoreSelector } from './redux/use-store-selector';
import { mainApiReducer } from './main-api/main-api-reducer';
import { TransportedDataStatus } from './communicated-data/communicated-data-types';
import { LOGIN_ROUTE } from './pages-impl/client-side/login/login-routes';
import { navigate } from 'gatsby';

let previousRuntimeData:
  | undefined
  | {
      storeManager: ReturnType<typeof createStoreManager>;
    };
type ModuleHotData = {
  storeManager: ReturnType<typeof createStoreManager>;
};

const HandleAuth = (props: { children: ReactNode }) => {
  const dispatch = useStoreDispatch({ mainApi: mainApiReducer });

  const mainApiSession = useUserAuth();

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

  return <>{props.children}</>;
};

export const App = (props: { children: ReactNode }) => {
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
    <>
      <Helmet>
        <style>{dom.css()}</style>
      </Helmet>
      <SSRProvider>
        <StoreManagerProvider storeManager={storeManager}>
          <Provider store={storeManager.store}>
            <HandleAuth>{props.children}</HandleAuth>
          </Provider>
        </StoreManagerProvider>
      </SSRProvider>
    </>
  );
};

