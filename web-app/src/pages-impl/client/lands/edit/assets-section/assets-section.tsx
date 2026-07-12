import React from 'react';
import { useState } from 'react';
import {
  CommunicatedData,
  CommunicatedDataStatus,
} from '../../../../../core/communicated-data/communicated-data-types';
import { CommunicatedDataGate } from '../../../../../core/ui/communicated-data-gate';
import { TiledJSONFieldState } from './tiled-json-form-field';
import { TilesetImageFieldState } from './tileset-image-form-field';
import { TiledJSONField } from './tiled-json-form-field';
import { TilesetImageFormField } from './tileset-image-form-field';
import { GetLandDTO } from '../../../../../core/api/routes/lands/lands-api';
import { LinkAnchor } from '../../../../../core/ui/link-anchor';
import { useLandsAPI } from '../../../../../core/api/routes/lands/lands-api';
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
    CommunicatedData<
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
  >({ status: CommunicatedDataStatus.NotInitialized });

  const submitForm = async (args: { mapFile: File; tilesetFile: File }) => {
    replaceFormSubmissionStatus({ status: CommunicatedDataStatus.Loading });

    const formData = new FormData();

    formData.append('map', args.mapFile);
    formData.append('tileset', args.tilesetFile);

    const res = await api.uploadAssets({
      landId: props.land.id,
      formData,
    });

    if (res.error) {
      replaceFormSubmissionStatus({ status: res.error });
    } else {
      if (res.response.error) {
        replaceFormSubmissionStatus({
          status: CommunicatedDataStatus.Done,
          data: res.response,
        });
      } else {
        replaceFormSubmissionStatus({
          status: CommunicatedDataStatus.NotInitialized,
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
            <CommunicatedDataGate dataWrapper={formSubmissionStatus}>
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
            </CommunicatedDataGate>
          </div>

          {!tiledJSONFieldState?.error &&
          tiledJSONFieldState?.value &&
          !tilesetImageFieldState?.error &&
          tilesetImageFieldState?.value ? (
            <div className="mt-3">
              <button
                className="d-block w-100 btn btn-success"
                disabled={
                  formSubmissionStatus.status === CommunicatedDataStatus.Loading
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
