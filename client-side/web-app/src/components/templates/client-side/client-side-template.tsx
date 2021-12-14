import { Router } from '@reach/router';
import NotFoundTemplate from 'src/pages/404';
import { ClientSideIndexTemplate } from './index/index-template';
import { LoginTemplate } from './login/login-template';

export function ClientSideTemplate() {
  return (
    <Router basepath="/client-side">
      <ClientSideIndexTemplate path="/" />
      <LoginTemplate path="/login" />
      <NotFoundTemplate default />
    </Router>
  );
}
