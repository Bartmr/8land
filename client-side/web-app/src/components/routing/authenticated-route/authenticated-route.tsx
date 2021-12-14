import React from 'react';
import {
  AuthenticatedRouteRules,
  AuthenticatedRouteAccess,
} from './authenticated-route-types';
import { useStoreSelector } from 'src/logic/app-internals/store/use-store-selector';
import { TransportedDataGate } from 'src/components/shared/transported-data-gate/transported-data-gate';
import { Redirect } from '../redirect/redirect';
import { LOGIN_ROUTE } from 'src/components/templates/client-side/login/login-routes';
import { CLIENT_SIDE_INDEX_ROUTE } from 'src/components/templates/client-side/index/index-routes';
import { mainApiReducer } from 'src/logic/app-internals/apis/main/main-api-reducer';
import { RouteComponentProps } from '@reach/router';
import { isTransportFailure } from 'src/logic/app-internals/transports/transported-data/is-transport-failure';
import { TransportedDataStatus } from 'src/logic/app-internals/transports/transported-data/transported-data-types';
import { RequiredFields } from '@app/shared/internals/utils/types/requirement-types';

interface Props extends RequiredFields<RouteComponentProps, 'path'> {
  component: React.JSXElementConstructor<RouteComponentProps>;
  authenticationRules: AuthenticatedRouteRules;
}

export const AuthenticatedRoute = ({
  authenticationRules,
  component: Component,
  ...rest
}: Props) => {
  const sessionWrapper = useStoreSelector(
    { mainApi: mainApiReducer },
    (state) => state.mainApi.session,
  );

  if (typeof sessionWrapper.data === 'undefined') {
    return null;
  } else if (
    isTransportFailure(sessionWrapper.status) ||
    sessionWrapper.status === TransportedDataStatus.Loading
  ) {
    return (
      <TransportedDataGate dataWrapper={sessionWrapper}>
        {() => null}
      </TransportedDataGate>
    );
  } else {
    const session = sessionWrapper.data;
    const mainApiAuthRule = authenticationRules.mainApiSession;

    if (mainApiAuthRule.access === AuthenticatedRouteAccess.Allow) {
      if (session) {
        /*
          IMPORTANT:
          Route component must be the one returned
          Do not wrap it in anything
        */
        return <Component {...rest} />;
      } else {
        return (
          <Redirect
            href={mainApiAuthRule.hrefToRedirectTo || LOGIN_ROUTE.getHref()}
          />
        );
      }
    } else {
      if (session) {
        return (
          <Redirect
            href={
              mainApiAuthRule.hrefToRedirectTo ||
              CLIENT_SIDE_INDEX_ROUTE.getHref()
            }
          />
        );
      } else {
        /*
          IMPORTANT:
          Route component must be the one returned
          Do not wrap it in anything
        */
        return <Component {...rest} />;
      }
    }
  }
};
