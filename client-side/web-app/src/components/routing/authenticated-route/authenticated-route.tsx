import React, { ReactNode } from 'react';
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
import { RequiredFields } from '@app/shared/internals/utils/types/requirement-types';
import { getCurrentLocalHref } from 'src/logic/app-internals/navigation/get-current-local-href';
import { useLocation } from '@reach/router';

type Props = RequiredFields<RouteComponentProps, 'path'> & {
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
