import { Router } from '@reach/router';
import { AuthenticatedRoute } from '../../users/authentication/authenticated-route';
import NotFound from '../../pages/404';
import { Login } from './login/login';
import { Signup } from './signup/signup';
import React, { Suspense } from 'react';
import { RouteComponentProps } from '@reach/router';
import { CommunicatedDataGate } from '../../ui/communicated-data-gate';
import { CommunicatedDataStatus } from '../../communicated-data/communicated-data-types';
import { EditLand } from './lands/edit/edit-land';
import { EDIT_LAND_ROUTE } from './lands/edit/edit-land-routes';
import { LANDS_ROUTE } from './lands/lands-routes';
import { Lands } from './lands/lands';
import { User } from './user/user';
import { USER_ROUTE } from './user/user-routes';

function Game(_props: RouteComponentProps) {
  const LazyLoadedRoute = React.lazy(async () => {
    const { ClientSideIndex } = await import('./index/index');
    return { default: ClientSideIndex };
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

export function Client() {
  return (
    <Router>
      <Game path="/client/" />
      <AuthenticatedRoute
        path="/client"
      >
        <Lands path={`${LANDS_ROUTE.pathSegment}`} />
        <EditLand
          path={`${LANDS_ROUTE.pathSegment}${EDIT_LAND_ROUTE.pathSegment}/:id`}
        />
        <User path={USER_ROUTE.pathSegment} />
        <NotFound default />
      </AuthenticatedRoute>
      <Login
        path="/client/login"
      />
      <Signup
        path="/client/signup"
      />
      <NotFound default />
    </Router>
  );
}
