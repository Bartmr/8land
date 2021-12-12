import { Router } from '@reach/router';
import { ClientSideIndexTemplate } from './index/index-template';

export function ClientSideTemplate() {
  return (
    <Router basepath="/client-side">
      <ClientSideIndexTemplate path="/" />
    </Router>
  );
}
