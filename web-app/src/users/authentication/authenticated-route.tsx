import React, { ReactNode, useContext } from 'react';
import { useStoreSelector } from '../../redux/use-store-selector';
import { TransportedDataGate } from '../../ui/transported-data-gate';
import { Redirect } from '../../pages-impl/redirect/redirect';
import { LOGIN_ROUTE } from '../../pages-impl/client/login/login-routes';
import { getCurrentLocalHref } from '../../navigation/current-local-href';
import { useLocation } from '@reach/router';
import { AuthenticationStateContext } from './authentication-state';
import { throwError } from '../../throw-error';
import { TransportedDataStatus } from '../../communicated-data/communicated-data-types';

type Props = {
  children: ReactNode;
  // For react-router
  path: string;
};

export const AuthenticatedRoute = (props: Props) => {
  const location = useLocation();

  const { sessionState } = useContext(AuthenticationStateContext) || throwError();

  if (typeof sessionState.data === 'undefined') {
    if (sessionState.error) {
      return (
        <TransportedDataGate className="py-3" dataWrapper={{ status: sessionState.error }}>
          {() => null}
        </TransportedDataGate>
      );
    } else {
      return (
        <TransportedDataGate className="py-3" dataWrapper={{ status: TransportedDataStatus.Loading, data: undefined }}>
          {() => null}
        </TransportedDataGate>
      );
    }

  } else {
    const session = sessionState.data;

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
