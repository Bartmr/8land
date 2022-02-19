import 'src/components/ui-kit/global-styles/global-styles';

import { Router } from '@reach/router';
import { AuthenticatedRoute } from 'src/components/routing/authenticated-route/authenticated-route';
import { AuthenticatedRouteAccess } from 'src/components/routing/authenticated-route/authenticated-route-types';
import NotFoundTemplate from 'src/pages/404';
import { LoginTemplate } from './login/login-template';
import React, { Suspense } from 'react';
import { RouteComponentProps } from '@reach/router';
import { TransportedDataGate } from 'src/components/shared/transported-data-gate/transported-data-gate';
import { TransportedDataStatus } from 'src/logic/app-internals/transports/transported-data/transported-data-types';
import { EditLandTemplate } from './lands/edit/edit-land-template';
import { EDIT_LAND_ROUTE } from './lands/edit/edit-land-routes';
import { LANDS_ROUTE } from './lands/lands-routes';
import { LandsTemplate } from './lands/lands-template';
import { UserTemplate } from './user/user-template';
import { USER_ROUTE } from './user/user-routes';
import { TerritoriesTemplate } from './territories/territories-template';
import { TERRITORIES_ROUTE } from './territories/territories-routes';
import { EditTerritoryTemplate } from './territories/edit/edit-territory-template';

function Game(_props: RouteComponentProps) {
  const LazyLoadedRoute = React.lazy(async () => {
    const { ClientSideIndexTemplate } = await import('./index/index-template');
    return { default: ClientSideIndexTemplate };
  });

  return (
    <Suspense
      fallback={
        <TransportedDataGate
          dataWrapper={{ status: TransportedDataStatus.Loading }}
        >
          {() => null}
        </TransportedDataGate>
      }
    >
      <LazyLoadedRoute />
    </Suspense>
  );
}

export function ClientSideTemplate() {
  return (
    <Router>
      <Game path="/client-side/" />
      <AuthenticatedRoute
        authenticationRules={{
          mainApiSession: { access: AuthenticatedRouteAccess.Allow },
        }}
        path="/client-side"
      >
        <LandsTemplate path={`${LANDS_ROUTE.pathSegment}`} />
        <EditLandTemplate
          path={`${LANDS_ROUTE.pathSegment}${EDIT_LAND_ROUTE.pathSegment}/:id`}
        />
        <UserTemplate path={USER_ROUTE.pathSegment} />
        <TerritoriesTemplate path={TERRITORIES_ROUTE.pathSegment} />
        <EditTerritoryTemplate path={`${TERRITORIES_ROUTE.pathSegment}/:id`} />
        <NotFoundTemplate default />
      </AuthenticatedRoute>
      <AuthenticatedRoute
        authenticationRules={{
          mainApiSession: { access: AuthenticatedRouteAccess.Block },
        }}
        path="/client-side/login"
      >
        <LoginTemplate path="/" />
      </AuthenticatedRoute>
      <NotFoundTemplate default />
    </Router>
  );
}
