import { Layout } from 'src/components/routing/layout/layout';
import { INDEX_ROUTE } from './index-routes';

export function IndexTemplate() {
  return <Layout title={INDEX_ROUTE.label}>{() => null}</Layout>;
}
