import { RouteComponentProps } from '@reach/router';
import { Layout } from 'src/components/routing/layout/layout';
import { LOGIN_ROUTE } from './login-routes';

function Content() {
  return null;
}

export function LoginTemplate(_props: RouteComponentProps) {
  return <Layout title={LOGIN_ROUTE.title}>{() => <Content />}</Layout>;
}
