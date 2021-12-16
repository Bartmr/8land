import { Router } from '@reach/router';
import { AuthenticatedRoute } from 'src/components/routing/authenticated-route/authenticated-route';
import { AuthenticatedRouteAccess } from 'src/components/routing/authenticated-route/authenticated-route-types';
import NotFoundTemplate from 'src/pages/404';
import { ClientSideIndexTemplate } from './index/index-template';
import { LoginTemplate } from './login/login-template';

export function ClientSideTemplate() {
  return (
    <Router basepath="/client-side">
      <AuthenticatedRoute
        authenticationRules={{
          mainApiSession: { access: AuthenticatedRouteAccess.Allow },
        }}
        path="/"
      >
        <ClientSideIndexTemplate path="/" />
      </AuthenticatedRoute>
      <AuthenticatedRoute
        authenticationRules={{
          mainApiSession: { access: AuthenticatedRouteAccess.Block },
        }}
        path="/login"
      >
        <LoginTemplate path="/" />
      </AuthenticatedRoute>
      <NotFoundTemplate default />
    </Router>
  );
}
