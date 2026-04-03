import { GetTerritoryDTO } from '../../../../main-api/routes/territories/territories.dtos';
import { RouteComponentProps, useParams } from '@reach/router';
import { uuid, z } from 'zod';
import { useEffect, useState } from 'react';
import { Accordion, Toast } from 'react-bootstrap';
import { Layout } from '../../../layout/layout';
import { TransportedDataGate } from '../../../../ui/transported-data-gate';
import { CommunicationError } from '../../../../communication-errors/communication-errors';
import {
  TransportedData,
  TransportedDataStatus,
} from '../../../../communicated-data/communicated-data-types';
import { useTerritoriesAPI } from '../../../../main-api/routes/territories/territories-api';
import { AssetsUploader } from './assets-uploader/assets-uploader';

function EditTerritoryWithTerritory(props: {
  territory: GetTerritoryDTO;
  fetchTerritory: () => void;
}) {
  const [successfulSave, replaceSuccessfulSave] = useState(false);

  const onSuccessfulSave = async () => {
    replaceSuccessfulSave(true);

    props.fetchTerritory();
  };

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
          <Toast
            className="bg-success w-100 mb-4"
            onClose={() => replaceSuccessfulSave(false)}
            show={successfulSave}
            delay={10000}
            autohide
          >
            <Toast.Header closeButton={false}>Changes saved</Toast.Header>
          </Toast>
          <AssetsUploader
            territory={props.territory}
            fetchTerritory={onSuccessfulSave}
          />
        </div>
      </div>
    </div>
  );
}

function EditTerritoryWithRouteProps(props: { id: string }) {
  const api = useTerritoriesAPI();

  const [territory, replaceTerritory] = useState<
    TransportedData<GetTerritoryDTO>
  >({ status: TransportedDataStatus.NotInitialized });

  const fetchTerritory = async () => {
    const res = await api.getTerritory({ territoryId: props.id });

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

  const validationResult = z.object({
    id: uuid(),
  }).safeParse(routeParams);

  return (
    <Layout>
      {() => {
        return !validationResult.success ? (
          <TransportedDataGate
            dataWrapper={{ status: CommunicationError.NotFound }}
          >
            {() => null}
          </TransportedDataGate>
        ) : (
          <EditTerritoryWithRouteProps id={validationResult.data.id} />
        );
      }}
    </Layout>
  );
}
