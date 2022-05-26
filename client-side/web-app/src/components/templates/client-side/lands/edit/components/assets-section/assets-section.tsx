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
import { GetLandDTO } from '@app/shared/land/get/get-land.dto';
import { LinkAnchor } from 'src/components/ui-kit/protons/link-anchor/link-anchor';
import { useLandsAPI } from 'src/logic/lands/lands-api';
import { START_LANDS_LIMIT_EXCEEDED_MESSAGE } from './assets-section.constants';

export function AssetsSection(props: {
  land: GetLandDTO;
  onSuccessfulSave: () => void;
}) {
  const api = useLandsAPI();

  const [tiledJSONFieldState, replaceTiledJSONFieldState] =
    useState<TiledJSONFieldState>(undefined);
  const [tilesetImageFieldState, replaceTilesetImageFieldState] =
    useState<TilesetImageFieldState>(undefined);

  const [formSubmissionStatus, replaceFormSubmissionStatus] = useState<
    TransportedData<
      | {
          error:
            | 'start-lands-limit-exceeded'
            | 'cannot-have-train-block-in-world-lands'
            | 'only-one-land-can-have-a-start-block'
            | 'cannot-remove-start-block'
            | 'must-have-start-block-in-first-land'
            | 'cannot-have-start-block-in-admin-lands';
        }
      | undefined
    >
  >({ status: TransportedDataStatus.NotInitialized });

  const submitForm = async (args: { mapFile: File; tilesetFile: File }) => {
    replaceFormSubmissionStatus({ status: TransportedDataStatus.Loading });

    const formData = new FormData();

    formData.append('map', args.mapFile);
    formData.append('tileset', args.tilesetFile);

    const res = await api.uploadAssets({
      landId: props.land.id,
      formData,
    });

    if (res.failure) {
      replaceFormSubmissionStatus({ status: res.failure });
    } else {
      if (res.response.error) {
        replaceFormSubmissionStatus({
          status: TransportedDataStatus.Done,
          data: res.response,
        });
      } else {
        replaceFormSubmissionStatus({
          status: TransportedDataStatus.NotInitialized,
        });

        replaceTiledJSONFieldState(undefined);
        replaceTilesetImageFieldState(undefined);

        props.onSuccessfulSave();
      }
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

          <div className="my-3">
            <TransportedDataGate dataWrapper={formSubmissionStatus}>
              {({ data }) => {
                return (
                  <span className="text-danger">
                    {(() => {
                      if (data?.error === 'start-lands-limit-exceeded') {
                        return START_LANDS_LIMIT_EXCEEDED_MESSAGE;
                      } else if (
                        data?.error === 'must-have-start-block-in-first-land'
                      ) {
                        return 'You must have a start block in your first land, so visitors can be dropped there';
                      } else if (
                        data?.error === 'only-one-land-can-have-a-start-block'
                      ) {
                        return 'You can only have a start block in your first land';
                      } else if (data?.error === 'cannot-remove-start-block') {
                        return "You cannot remove a start block once it's there or else visitors won't be able to be dropped or get back to your lands. You can always reposition it in the map.";
                      } else if (
                        data?.error === 'cannot-have-train-block-in-world-lands'
                      ) {
                        return "Sneaky. You can't have a train block in your land. That's our responsability.";
                      } else if (
                        data?.error === 'cannot-have-start-block-in-admin-lands'
                      ) {
                        return "Remember: you're the admin. You can't have lands with start blocks.";
                      } else {
                        return null;
                      }
                    })()}
                  </span>
                );
              }}
            </TransportedDataGate>
          </div>

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
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}
