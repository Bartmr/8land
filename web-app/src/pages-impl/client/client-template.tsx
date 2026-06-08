import { Router } from '@reach/router';
import { AuthenticatedRoute } from '../../users/authentication/authenticated-route';
import NotFoundTemplate from '../../pages/404';
import { LoginTemplate } from './login/login-template';
import React, { Suspense } from 'react';
import { RouteComponentProps } from '@reach/router';
import { CommunicatedDataGate } from '../../ui/communicated-data-gate';
import { CommunicatedDataStatus } from '../../communicated-data/communicated-data-types';
import { EditLandTemplate } from './lands/edit/edit-land-template';
import { EDIT_LAND_ROUTE } from './lands/edit/edit-land-routes';
import { LANDS_ROUTE } from './lands/lands-routes';
import { LandsTemplate } from './lands/lands-template';
import { UserTemplate } from './user/user-template';
import { USER_ROUTE } from './user/user-routes';

function Game(_props: RouteComponentProps) {
  const LazyLoadedRoute = React.lazy(async () => {
    const { ClientSideIndexTemplate } = await import('./index/index-template');
    return { default: ClientSideIndexTemplate };
  });

  return (
    <Suspense
      fallback={
        <CommunicatedDataGate
          dataWrapper={{ status: CommunicatedDataStatus.Loading }}
        >
          {() => null}
        </CommunicatedDataGate>
      }
    >
      <LazyLoadedRoute />
    </Suspense>
  );
}

export function ClientTemplate() {
  return (
    <Router>
      <Game path="/client/" />
      <AuthenticatedRoute
        path="/client"
      >
        <LandsTemplate path={`${LANDS_ROUTE.pathSegment}`} />
        <EditLandTemplate
          path={`${LANDS_ROUTE.pathSegment}${EDIT_LAND_ROUTE.pathSegment}/:id`}
        />
        <UserTemplate path={USER_ROUTE.pathSegment} />
        <NotFoundTemplate default />
      </AuthenticatedRoute>
      <LoginTemplate
        path="/client/login"
      />
      <NotFoundTemplate default />
    </Router>
  );
}
