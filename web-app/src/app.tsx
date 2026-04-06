import './logging/logger';
import './environment-variables';
import './ui/index.scss';
import './ui/icons.scss';

import React, { ReactNode, useEffect, useMemo, useState } from 'react';
import { dom } from '@fortawesome/fontawesome-svg-core';
import { createStoreManager, StoreManagerProvider } from './redux/store-manager';
import { Provider } from 'react-redux';
import { useStoreDispatch } from './redux/use-store-dispatch';
import { useUserAuth } from './users/auth/use-user-auth';
import { useStoreSelector } from './redux/use-store-selector';
import { mainApiReducer } from './main-api/main-api-reducer';
import { TransportedDataStatus } from './communicated-data/communicated-data-types';
import { LOGIN_ROUTE } from './pages-impl/client/login/login-routes';
import { navigate } from 'gatsby';

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
  const storeManager = useMemo(() => createStoreManager(), []);

  return (
    <>
      <style>{dom.css()}</style>
      <StoreManagerProvider storeManager={storeManager}>
        <Provider store={storeManager.store}>
          <HandleAuth>{props.children}</HandleAuth>
        </Provider>
      </StoreManagerProvider>
    </>
  );
};

