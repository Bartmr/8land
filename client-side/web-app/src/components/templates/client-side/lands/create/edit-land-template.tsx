import { Layout } from 'src/components/routing/layout/layout';
import { EDIT_LAND_ROUTE } from './edit-land-routes';
import { RouteComponentProps } from '@reach/router';
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

export function EditLandTemplate(_props: RouteComponentProps) {
  const [tiledJSONFieldState, replaceTiledJSONFieldState] =
    useState<TiledJSONFieldState>(undefined);
  const [tilesetImageFieldState, replaceTilesetImageFieldState] =
    useState<TilesetImageFieldState>(undefined);

  const [formSubmissionStatus, replaceFormSubmissionStatus] = useState<
    TransportedData<undefined>
  >({ status: TransportedDataStatus.NotInitialized });

  return (
    <Layout title={EDIT_LAND_ROUTE.label}>
      {() => {
        return (
          <>
            <h2>Map and Graphics</h2>
            <div className="card">
              <div className="card-body">
                <div className="mb-3"></div>
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
                        formSubmissionStatus.status ===
                        TransportedDataStatus.Loading
                      }
                      onClick={() => {
                        replaceFormSubmissionStatus({
                          status: TransportedDataStatus.Loading,
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
      }}
    </Layout>
  );
}
