import { GetTerritoryDTO } from '@app/shared/territories/get/get-territory.dto';
import { useState } from 'react';
import {
  TransportedDataGate,
  TransportedDataGateLayout,
} from 'src/components/shared/transported-data-gate/transported-data-gate';
import { LinkAnchor } from 'src/components/ui-kit/protons/link-anchor/link-anchor';
import { useMainJSONApi } from 'src/logic/app-internals/apis/main/use-main-json-api';
import {
  TransportedData,
  TransportedDataStatus,
} from 'src/logic/app-internals/transports/transported-data/transported-data-types';
import { MapFormField } from './components/map-form-field';
import { TilesetFormField } from './components/tileset-form-field';

export function AssetsUploader(props: {
  territory: GetTerritoryDTO;
  fetchTerritory: () => void;
}) {
  const api = useMainJSONApi();

  const [errors, replaceErrors] = useState<
    'map-missing' | 'tileset-missing' | undefined
  >(undefined);

  const [formSubmissionStatus, replaceFormSubmissionStatus] = useState<
    TransportedData<undefined>
  >({ status: TransportedDataStatus.NotInitialized });

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

    replaceFormSubmissionStatus({ status: TransportedDataStatus.Loading });

    const formData = new FormData();

    formData.append('map', mapFile);
    formData.append('tileset', tilesetFile);

    const res = await api.put<
      { status: 204; body: undefined },
      undefined,
      FormData
    >({
      path: `/territories/${props.territory.id}/assets`,
      query: undefined,
      acceptableStatusCodes: [204],
      body: formData,
    });

    if (res.failure) {
      replaceFormSubmissionStatus({ status: res.failure });
    } else {
      replaceFormSubmissionStatus({
        status: TransportedDataStatus.NotInitialized,
      });

      props.fetchTerritory();
    }
  };

  return (
    <div className="card">
      <div className="card-body">
        <h2 className="card-title h3">Assets</h2>

        {props.territory.assets ? (
          <>
            <LinkAnchor
              href={`${props.territory.assets.baseUrl}/${props.territory.assets.mapKey}`}
              className="text-success"
            >
              Download current Tiled map JSON file
            </LinkAnchor>
            <br />{' '}
            <LinkAnchor
              href={`${props.territory.assets.baseUrl}/${props.territory.assets.tilesetKey}`}
              className="text-success"
            >
              Download current Tileset picture
            </LinkAnchor>
            <hr />
          </>
        ) : null}
        <TilesetFormField onChange={replaceTilesetFile} />
        <div className="mb-3"></div>
        <MapFormField territory={props.territory} onChange={replaceMapFile} />
        <div className="mt-4 d-flex justify-content-start align-items-center">
          <button
            onClick={submitForm}
            disabled={
              formSubmissionStatus.status === TransportedDataStatus.Loading
            }
            className="btn btn-success"
          >
            Submit
          </button>
          <TransportedDataGate
            className="ms-3"
            layout={TransportedDataGateLayout.Tape}
            dataWrapper={formSubmissionStatus}
          >
            {() => null}
          </TransportedDataGate>
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
        </div>
      </div>
    </div>
  );
}
