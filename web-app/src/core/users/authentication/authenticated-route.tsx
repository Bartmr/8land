import React, { ReactNode, useContext } from 'react';
import { CommunicatedDataGate } from '../../ui/communicated-data-gate';
import { Redirect } from '../../navigation/redirect/redirect';
import { LOGIN_ROUTE } from '../../../pages-impl/client/login/login-routes';
import { getCurrentLocalHref } from '../../navigation/current-local-href';
import { useLocation } from '@reach/router';
import { AuthenticationStateContext } from './authentication-state';
import { throwError } from '../../throw-error';
import { CommunicatedDataStatus } from '../../communicated-data/communicated-data-types';

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
        <CommunicatedDataGate className="py-3" dataWrapper={{ status: sessionState.error }}>
          {() => null}
        </CommunicatedDataGate>
      );
    } else {
      return (
        <CommunicatedDataGate className="py-3" dataWrapper={{ status: CommunicatedDataStatus.Loading, data: undefined }}>
          {() => null}
        </CommunicatedDataGate>
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
