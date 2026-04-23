import React, { ReactNode } from 'react';
import { useStoreSelector } from '../../redux/use-store-selector';
import { TransportedDataGate } from '../../ui/transported-data-gate';
import { Redirect } from '../../pages-impl/redirect/redirect';
import { LOGIN_ROUTE } from '../../pages-impl/client/login/login-routes';
import { getCurrentLocalHref } from '../../navigation/current-local-href';
import { useLocation } from '@reach/router';

type Props = {
  children: ReactNode;
  // For react-router
  path: string;
};

export const AuthenticatedRoute = (props: Props) => {
  const location = useLocation();

  const sessionWrapper = useStoreSelector(
    { mainApi: mainApiReducer },
    (state) => state.mainApi.session,
  );

  if (typeof sessionWrapper.data === 'undefined') {
    return (
      <TransportedDataGate className="py-3" dataWrapper={sessionWrapper}>
        {() => null}
      </TransportedDataGate>
    );
  } else {
    const session = sessionWrapper.data;

    if (session) {
      return <>{props.children}</>;
    } else {
      return (
        <Redirect
          href={
            LOGIN_ROUTE.getHref({ next: getCurrentLocalHref() })
          }
        />
      );
    }
    
  }
};
