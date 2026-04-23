import React from 'react';
import { GetTerritoryDTO } from '../../../../main-api/routes/territories/territories.dtos';
import { RouteComponentProps, useParams } from '@reach/router';
import { uuid, z } from 'zod';
import { useEffect, useState } from 'react';
import { Accordion, Toast } from 'react-bootstrap';
import { Layout } from '../../../layout/layout';
import { CommunicatedDataGate } from '../../../../ui/communicated-data-gate';
import { CommunicationError } from '../../../../communication-errors/communication-errors';
import {
  CommunicatedData,
  CommunicatedDataStatus,
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
    CommunicatedData<GetTerritoryDTO>
  >({ status: CommunicatedDataStatus.NotInitialized });

  const fetchTerritory = async () => {
    const res = await api.getTerritory({ territoryId: props.id });

    if (res.error) {
      replaceTerritory({ status: res.error });
    } else {
      replaceTerritory({
        status: CommunicatedDataStatus.Done,
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
    <CommunicatedDataGate dataWrapper={territory}>
      {({ data: loadedTerritory }) => (
        <EditTerritoryWithTerritory
          fetchTerritory={fetchTerritory}
          territory={loadedTerritory}
        />
      )}
    </CommunicatedDataGate>
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
          <CommunicatedDataGate
            dataWrapper={{ status: CommunicationError.NotFound }}
          >
            {() => null}
          </CommunicatedDataGate>
        ) : (
          <EditTerritoryWithRouteProps id={validationResult.data.id} />
        );
      }}
    </Layout>
  );
}
