import React, { ReactNode } from 'react';
import {
  AuthenticatedRouteRules,
  AuthenticatedRouteAccess,
} from './authenticated-route-types';
import { useStoreSelector } from 'src/store/use-store-selector';
import { TransportedDataGate } from 'src/ui/transported-data-gate';
import { Redirect } from '../redirect/redirect';
import { LOGIN_ROUTE } from 'src/pages-impl/client-side/login/login-routes';
import { CLIENT_SIDE_INDEX_ROUTE } from 'src/pages-impl/client-side/index/index-routes';
import { mainApiReducer } from 'src/main-api/main-api-reducer';
import { getCurrentLocalHref } from 'src/navigation/current-local-href';
import { useLocation } from '@reach/router';

type Props = {
  authenticationRules: AuthenticatedRouteRules;
  children: ReactNode;
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
    const mainApiAuthRule = props.authenticationRules.mainApiSession;

    if (mainApiAuthRule.access === AuthenticatedRouteAccess.Allow) {
      if (session) {
        return <>{props.children}</>;
      } else {
        return (
          <Redirect
            href={
              mainApiAuthRule.hrefToRedirectTo ||
              LOGIN_ROUTE.getHref({ next: getCurrentLocalHref() })
            }
          />
        );
      }
    } else {
      if (session) {
        const searchParams = new URLSearchParams(window.location.search);

        const next = searchParams.get('next');

        return (
          <Redirect
            href={
              mainApiAuthRule.hrefToRedirectTo ||
              (next && !next.startsWith(location.pathname)
                ? next
                : undefined) ||
              CLIENT_SIDE_INDEX_ROUTE.getHref()
            }
          />
        );
      } else {
        return <>{props.children}</>;
      }
    }
  }
};
