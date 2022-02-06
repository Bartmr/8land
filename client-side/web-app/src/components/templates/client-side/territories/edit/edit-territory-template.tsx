import { ToIndexedType } from '@app/shared/internals/transports/dto-types';
import { uuid } from '@app/shared/internals/validation/schemas/uuid.schema';
import { GetTerritoryDTO } from '@app/shared/territories/get/get-territory.dto';
import { RouteComponentProps, useParams } from '@reach/router';
import { object } from 'not-me/lib/schemas/object/object-schema';
import { useEffect, useState } from 'react';
import { Accordion } from 'react-bootstrap';
import { Layout } from 'src/components/routing/layout/layout';
import { TransportedDataGate } from 'src/components/shared/transported-data-gate/transported-data-gate';
import { useMainJSONApi } from 'src/logic/app-internals/apis/main/use-main-json-api';
import { TransportFailure } from 'src/logic/app-internals/transports/transported-data/transport-failures';
import {
  TransportedData,
  TransportedDataStatus,
} from 'src/logic/app-internals/transports/transported-data/transported-data-types';
import { AssetsUploader } from './components/assets-uploader/assets-uploader';
import { EDIT_TERRITORY_ROUTE } from './edit-territory-routes';

function EditTerritoryWithTerritory(props: {
  territory: GetTerritoryDTO;
  fetchTerritory: () => void;
}) {
  return (
    <div>
      <h1>Territory @ {props.territory.inLand.name}</h1>
      <div>
        <span>
          Width: {props.territory.endX - props.territory.startX} squares
        </span>
        <br />
        <span>
          Height: {props.territory.endY - props.territory.startY} squares
        </span>
      </div>
      <Accordion className="d-block d-md-none mt-3">
        <Accordion.Item eventKey="0">
          <Accordion.Header>See thumbnail</Accordion.Header>
          <Accordion.Body>
            <img
              alt="Thumbnail"
              width={'100%'}
              src={props.territory.thumbnailUrl}
            />
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
      <hr />

      <div className="row g-3">
        <div className="col-3 d-none d-md-block">
          <img
            alt="Thumbnail"
            width={'100%'}
            src={props.territory.thumbnailUrl}
          />
        </div>
        <div className="col-12 col-md-9">
          <AssetsUploader
            territory={props.territory}
            fetchTerritory={props.fetchTerritory}
          />
        </div>
      </div>
    </div>
  );
}

function EditTerritoryWithRouteProps(props: { id: string }) {
  const mainApi = useMainJSONApi();

  const [territory, replaceTerritory] = useState<
    TransportedData<GetTerritoryDTO>
  >({ status: TransportedDataStatus.NotInitialized });

  const fetchTerritory = async () => {
    const res = await mainApi.get<
      { status: 200; body: ToIndexedType<GetTerritoryDTO> },
      undefined
    >({
      path: `/territories/${props.id}`,
      query: undefined,
      acceptableStatusCodes: [200],
    });

    if (res.failure) {
      replaceTerritory({ status: res.failure });
    } else {
      replaceTerritory({
        status: TransportedDataStatus.Done,
        data: res.response.body,
      });
    }
  };

  useEffect(() => {
    (async () => {
      await fetchTerritory();
    })();
  }, [props.id]);

  return (
    <TransportedDataGate dataWrapper={territory}>
      {({ data: loadedTerritory }) => (
        <EditTerritoryWithTerritory
          fetchTerritory={fetchTerritory}
          territory={loadedTerritory}
        />
      )}
    </TransportedDataGate>
  );
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
          <EditTerritoryWithRouteProps id={validationResult.value.id} />
        );
      }}
    </Layout>
  );
}
