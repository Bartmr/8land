import { uuid } from '@app/shared/internals/validation/schemas/uuid.schema';
import { RouteComponentProps, useParams } from '@reach/router';
import { object } from 'not-me/lib/schemas/object/object-schema';
import { Layout } from 'src/components/routing/layout/layout';
import { TransportedDataGate } from 'src/components/shared/transported-data-gate/transported-data-gate';
import { TransportFailure } from 'src/logic/app-internals/transports/transported-data/transport-failures';
import { EDIT_TERRITORY_ROUTE } from './edit-territory-routes';

function EditTerritoryWithRouteProps() {
  return null;
}

export function EditTerritoryTemplate(_props: RouteComponentProps) {
  const routeParams = useParams() as unknown;

  const validationResult = object({
    id: uuid().required(),
  })
    .required()
    .validate(routeParams);

  return (
    <Layout title={EDIT_TERRITORY_ROUTE.label}>
      {() => {
        return validationResult.errors ? (
          <TransportedDataGate
            dataWrapper={{ status: TransportFailure.NotFound }}
          >
            {() => null}
          </TransportedDataGate>
        ) : (
          <EditTerritoryWithRouteProps />
        );
      }}
    </Layout>
  );
}
