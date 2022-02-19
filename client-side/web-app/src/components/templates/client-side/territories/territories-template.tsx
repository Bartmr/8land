import { RouteComponentProps } from '@reach/router';
import { Layout } from 'src/components/routing/layout/layout';
import { TERRITORIES_ROUTE } from './territories-routes';

function TerritoriesTemplateContent() {
  return <p>! TO BE DONE !</p>;
}

export function TerritoriesTemplate(_props: RouteComponentProps) {
  return (
    <Layout title={TERRITORIES_ROUTE.title}>
      {() => <TerritoriesTemplateContent />}
    </Layout>
  );
}
