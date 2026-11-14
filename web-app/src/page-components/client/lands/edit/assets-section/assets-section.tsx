import React from 'react';
import { useState } from 'react';
import { CommunicationError } from '../../../../../communication-errors/communication-errors';
import {
  FaExclamationCircle,
  FaWifi,
} from 'react-icons/fa';
import { TiledJSONFieldState } from './tiled-json-form-field';
import { TilesetImageFieldState } from './tileset-image-form-field';
import { TiledJSONField } from './tiled-json-form-field';
import { TilesetImageFormField } from './tileset-image-form-field';
import { GetLandDTO } from '../../../../../api/routes/lands/lands-api';
import { LinkAnchor } from '../../../../../ui/link-anchor';
import { useLandsAPI } from '../../../../../api/routes/lands/lands-api';
import { START_LANDS_LIMIT_EXCEEDED_MESSAGE } from './assets-section-constants';

export function AssetsSection(props: {
  land: GetLandDTO;
  onSuccessfulSave: () => void;
}) {
  const api = useLandsAPI();

  const [tiledJSONFieldState, replaceTiledJSONFieldState] =
    useState<TiledJSONFieldState>(undefined);
  const [tilesetImageFieldState, replaceTilesetImageFieldState] =
    useState<TilesetImageFieldState>(undefined);

  const [formSubmissionStatus, replaceFormSubmissionStatus] = useState<{
    loading?: boolean;
    error?: CommunicationError;
    data?:
      | {
          error:
            | 'start-lands-limit-exceeded'
            | 'cannot-have-train-block-in-world-lands'
            | 'only-one-land-can-have-a-start-block'
            | 'cannot-remove-start-block'
            | 'must-have-start-block-in-first-land'
            | 'cannot-have-start-block-in-admin-lands';
        }
      | undefined;
  }>({});

  const submitForm = async (args: { mapFile: File; tilesetFile: File }) => {
    replaceFormSubmissionStatus({ loading: true });

    const formData = new FormData();

    formData.append('map', args.mapFile);
    formData.append('tileset', args.tilesetFile);

    const res = await api.uploadAssets({
      landId: props.land.id,
      formData,
    });

    if (res.error) {
      replaceFormSubmissionStatus({ error: res.error });
    } else {
      if (res.response.error) {
        replaceFormSubmissionStatus({
          data: res.response,
        });
      } else {
        replaceFormSubmissionStatus({});

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
            <div className=" ">
              {formSubmissionStatus.loading && formSubmissionStatus.data === undefined ? (
                <div className="d-flex flex-column justify-content-center align-items-center">
                  <div
                    className="d-block spinner-lg spinner-border text-primary"
                    role="status"
                  >
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : null}
              {formSubmissionStatus.loading && formSubmissionStatus.data !== undefined ? (
                <div
                  style={{
                    zIndex: 1,
                    right: 'var(--spacer-3)',
                    position: 'fixed',
                  }}
                >
                  <div
                    className="d-block spinner-lg spinner-border text-primary"
                    role="status"
                  >
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : null}
              {formSubmissionStatus.error === CommunicationError.ConnectionFailure ? (
                <div className="d-flex flex-column justify-content-center align-items-center">
                  <FaWifi
                    className="text-danger"
                    style={{ fontSize: '2rem' }}
                  />
                  <p className="mt-3 text-center text-danger mb-0">
                    No Internet. Check your connection and try again.
                  </p>
                </div>
              ) : formSubmissionStatus.error === CommunicationError.AbortedAndDealtWith ? (
                <div className="d-flex flex-column justify-content-center align-items-center">
                  <p className="mt-3 text-center mb-0">Redirecting...</p>
                </div>
              ) : formSubmissionStatus.error === CommunicationError.UnexpectedResponse ? (
                <div className="d-flex flex-column justify-content-center align-items-center">
                  <FaExclamationCircle
                    className="text-danger"
                    style={{ fontSize: '2rem' }}
                  />
                  <p className="text-danger mt-3 text-center mb-0">
                    An unexpected error occurred. Try again later.
                  </p>
                </div>
              ) : null}
              {formSubmissionStatus.data !== undefined && !formSubmissionStatus.error ? (
                <span className="text-danger">
                  {(() => {
                    const data = formSubmissionStatus.data;

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
              ) : null}
            </div>
          </div>

          {!tiledJSONFieldState?.error &&
          tiledJSONFieldState?.value &&
          !tilesetImageFieldState?.error &&
          tilesetImageFieldState?.value ? (
            <div className="mt-3">
              <button
                className="d-block w-100 btn btn-success"
                disabled={formSubmissionStatus.loading}
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
