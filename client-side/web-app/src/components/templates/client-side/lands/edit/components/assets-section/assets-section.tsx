import { useState } from 'react';
import {
  TransportedData,
  TransportedDataStatus,
} from 'src/logic/app-internals/transports/transported-data/transported-data-types';
import { TransportedDataGate } from 'src/components/shared/transported-data-gate/transported-data-gate';
import { TiledJSONFieldState } from './components/tiled-json-form-field';
import { TilesetImageFieldState } from './components/tileset-image-form-field';
import { TiledJSONField } from './components/tiled-json-form-field';
import { TilesetImageFormField } from './components/tileset-image-form-field';
import { useMainJSONApi } from 'src/logic/app-internals/apis/main/use-main-json-api';
import { GetLandDTO } from '@app/shared/land/get/get-land.dto';
import { LinkAnchor } from 'src/components/ui-kit/protons/link-anchor/link-anchor';

export function AssetsSection(props: {
  land: GetLandDTO;
  onSuccessfulSave: () => void;
}) {
  const api = useMainJSONApi();

  const [tiledJSONFieldState, replaceTiledJSONFieldState] =
    useState<TiledJSONFieldState>(undefined);
  const [tilesetImageFieldState, replaceTilesetImageFieldState] =
    useState<TilesetImageFieldState>(undefined);

  const [formSubmissionStatus, replaceFormSubmissionStatus] = useState<
    TransportedData<undefined>
  >({ status: TransportedDataStatus.NotInitialized });

  const submitForm = async (args: { mapFile: File; tilesetFile: File }) => {
    replaceFormSubmissionStatus({ status: TransportedDataStatus.Loading });

    const formData = new FormData();

    formData.append('map', args.mapFile);
    formData.append('tileset', args.tilesetFile);

    const res = await api.put<
      { status: 204; body: undefined },
      undefined,
      FormData
    >({
      path: `/lands/${props.land.id}/assets`,
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

      replaceTiledJSONFieldState(undefined);
      replaceTilesetImageFieldState(undefined);

      props.onSuccessfulSave();
    }
  };

  return (
    <>
      <h2>Map and Graphics</h2>

      <div className="card">
        <div className="card-body">
          {props.land.assets ? (
            <LinkAnchor
              href={`${props.land.assets.baseUrl}/${props.land.assets.mapKey}`}
              className="text-success"
            >
              Download current Tiled map JSON file
            </LinkAnchor>
          ) : null}
          {props.land.assets ? (
            <>
              <br />{' '}
              <LinkAnchor
                href={`${props.land.assets.baseUrl}/${props.land.assets.tilesetKey}`}
                className="text-success"
              >
                Download current Tileset picture
              </LinkAnchor>
              <hr />
            </>
          ) : null}

          <TiledJSONField
            state={tiledJSONFieldState}
            onChange={replaceTiledJSONFieldState}
          />
          {!tiledJSONFieldState?.error && tiledJSONFieldState?.value ? (
            <TilesetImageFormField
              state={tilesetImageFieldState}
              onChange={replaceTilesetImageFieldState}
            />
          ) : null}

          {!tiledJSONFieldState?.error &&
          tiledJSONFieldState?.value &&
          !tilesetImageFieldState?.error &&
          tilesetImageFieldState?.value ? (
            <div className="mt-3">
              <button
                className="d-block w-100 btn btn-success"
                disabled={
                  formSubmissionStatus.status === TransportedDataStatus.Loading
                }
                onClick={async () => {
                  await submitForm({
                    mapFile: tiledJSONFieldState.value,
                    tilesetFile: tilesetImageFieldState.value,
                  });
                }}
              >
                Upload
              </button>
              <TransportedDataGate
                className="ms-3"
                dataWrapper={formSubmissionStatus}
              >
                {() => null}
              </TransportedDataGate>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}
