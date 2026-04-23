import React from 'react';
import { GetTerritoryDTO } from '../../../../../main-api/routes/territories/territories.dtos';
import { useState } from 'react';
import {
  CommunicatedDataGate,
  CommunicatedDataGateLayout,
} from '../../../../../ui/communicated-data-gate';
import { LinkAnchor } from '../../../../../ui/link-anchor';
import {
  CommunicatedData,
  CommunicatedDataStatus,
} from '../../../../../communicated-data/communicated-data-types';
import { useTerritoriesAPI } from '../../../../../main-api/routes/territories/territories-api';
import { MapFormField } from './map-form-field';
import { TilesetFormField } from './tileset-form-field';
import { CommunicationError } from '../../../../../communication-errors/communication-errors';

export function AssetsUploader(props: {
  territory: GetTerritoryDTO;
  fetchTerritory: () => void;
}) {
  const api = useTerritoriesAPI();

  const [errors, replaceErrors] = useState<
    | 'map-missing'
    | 'tileset-missing'
    | 'tileset-dimensions-dont-match'
    | 'train-and-start-block-not-allowed'
    | undefined
  >(undefined);

  const [formSubmissionStatus, replaceFormSubmissionStatus] = useState<
    CommunicatedData<undefined>
  >({ status: CommunicatedDataStatus.NotInitialized });

  const [tilesetFile, replaceTilesetFile] = useState<File | undefined>();
  const [mapFile, replaceMapFile] = useState<File | undefined>();

  const submitForm = async () => {
    if (!tilesetFile) {
      replaceErrors('tileset-missing');
      return;
    }

    if (!mapFile) {
      replaceErrors('map-missing');
      return;
    }

    replaceErrors(undefined);

    replaceFormSubmissionStatus({ status: CommunicatedDataStatus.Loading });

    const formData = new FormData();

    formData.append('map', mapFile);
    formData.append('tileset', tilesetFile);

    const res = await api.uploadAssets({
      territoryId: props.territory.id,
      formData,
    });

    if (res.error) {
      replaceFormSubmissionStatus({ status: res.error });
    } else {
      replaceFormSubmissionStatus({
        status: CommunicatedDataStatus.NotInitialized,
      });

      if (res.response.status === 400) {
        if (res.response.body?.error === 'tileset-dimensions-dont-match') {
          replaceErrors('tileset-dimensions-dont-match');
        } else if (
          res.response.body?.error === 'train-and-start-block-not-allowed'
        ) {
          replaceErrors('train-and-start-block-not-allowed');
        } else {
          replaceFormSubmissionStatus({
            status: CommunicationError.UnexpectedResponse,
          });
        }
      } else {
        props.fetchTerritory();
      }
    }
  };

  return (
    <div className="card">
      <div className="card-body">
        <h2 className="card-title h3">Assets</h2>

        {props.territory.assets ? (
          <>
            <p>
              <LinkAnchor
                href={`${props.territory.assets.baseUrl}/${props.territory.assets.mapKey}`}
                className="text-success"
              >
                Download current Tiled map JSON file
              </LinkAnchor>
            </p>
            <p>
              <LinkAnchor
                href={`${props.territory.assets.baseUrl}/${props.territory.assets.tilesetKey}`}
                className="text-success"
              >
                Download current Tileset picture
              </LinkAnchor>
            </p>
            <hr />
          </>
        ) : null}
        <TilesetFormField
          serverError={
            errors === 'tileset-dimensions-dont-match' ? errors : undefined
          }
          onChange={replaceTilesetFile}
        />
        <div className="mb-3"></div>
        <MapFormField territory={props.territory} onChange={replaceMapFile} />
        <div className="mt-4 d-flex justify-content-start align-items-center">
          <button
            onClick={submitForm}
            disabled={
              formSubmissionStatus.status === CommunicatedDataStatus.Loading
            }
            className="btn btn-success"
          >
            Submit
          </button>
          <CommunicatedDataGate
            className="ms-3"
            layout={CommunicatedDataGateLayout.Tape}
            dataWrapper={formSubmissionStatus}
          >
            {() => null}
          </CommunicatedDataGate>
          {errors === 'tileset-missing' ? (
            <span className="text-danger">
              You need to select a tileset file
            </span>
          ) : null}
          {errors === 'map-missing' ? (
            <span className="text-danger">
              You need to select a Tiled JSON file to use as map
            </span>
          ) : null}
          {errors === 'train-and-start-block-not-allowed' ? (
            <span className="text-danger">
              {'Territory maps cannot have "start" or "train" blocks'}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
