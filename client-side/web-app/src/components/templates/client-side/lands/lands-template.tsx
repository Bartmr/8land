import { IndexLandsDTO } from '@app/shared/land/index/index-lands.dto';
import { useEffect, useState } from 'react';
import { TransportedDataGate } from 'src/components/shared/transported-data-gate/transported-data-gate';
import {
  TransportedData,
  TransportedDataStatus,
} from 'src/logic/app-internals/transports/transported-data/transported-data-types';
import { RouteComponentProps } from '@reach/router';
import { Logger } from 'src/logic/app-internals/logging/logger';
import { TransportFailure } from 'src/logic/app-internals/transports/transported-data/transport-failures';
import { Layout } from 'src/components/routing/layout/layout';
import { LANDS_ROUTE } from './lands-routes';
import { LinkAnchor } from 'src/components/ui-kit/protons/link-anchor/link-anchor';
import { EDIT_LAND_ROUTE } from './edit/edit-land-routes';
import { useLandsAPI } from 'src/logic/lands/lands-api';
import { Toast } from 'react-bootstrap';
import { GetLandsToClaimDTO } from '@app/shared/land/lands-to-claim/lands-to-claim.dto';
import { START_LANDS_LIMIT_EXCEEDED_MESSAGE } from './edit/components/assets-section/assets-section.constants';

export function LandsTemplate(_props: RouteComponentProps) {
  const api = useLandsAPI();

  const [newLandName, replaceNewLandName] = useState('');

  const [newLandSubmission, replaceNewLandSubmission] = useState<
    TransportedData<
      | undefined
      | { error: 'name-already-taken' }
      | { error: 'lands-limit-exceeded'; limit: number }
      | { error: 'cannot-create-more-lands-without-start-block' }
    >
  >({
    status: TransportedDataStatus.Done,
    data: undefined,
  });

  const [landsToClaim, replaceLandsToClaim] = useState<
    TransportedData<GetLandsToClaimDTO>
  >({
    status: TransportedDataStatus.NotInitialized,
  });

  const [lands, replaceLands] = useState<TransportedData<IndexLandsDTO>>({
    status: TransportedDataStatus.NotInitialized,
  });

  const fetchLands = async () => {
    replaceLands({ status: TransportedDataStatus.Loading });

    const res = await api.getLandsIndex();

    if (res.failure) {
      replaceLands({
        status: res.failure,
      });
    } else {
      if (res.response.body.total > res.response.body.limit) {
        Logger.logError('lands-page-needs-pagination', new Error());

        window.alert('Lands page needs pagination');

        replaceLands({
          status: TransportFailure.UnexpectedResponse,
        });
      } else {
        replaceLands({
          status: TransportedDataStatus.Done,
          data: res.response.body,
        });
      }
    }
  };

  const fetchLandsToClaim = async () => {
    replaceLandsToClaim({ status: TransportedDataStatus.Loading });

    const res = await api.getLandsToClaim();

    if (res.failure) {
      replaceLands({
        status: res.failure,
      });
    } else {
      replaceLandsToClaim({
        status: TransportedDataStatus.Done,
        data: res.response.body,
      });
    }
  };

  const addLand = async () => {
    const confirmed = window.confirm(
      `Do you want to create a new land called "${newLandName}"`,
    );

    if (!confirmed) {
      return;
    }

    replaceNewLandSubmission({ status: TransportedDataStatus.Loading });

    const res = await api.createLand({ name: newLandName });

    if (res.failure) {
      replaceNewLandSubmission({
        status: res.failure,
      });
    } else {
      if (res.response.error) {
        replaceNewLandSubmission({
          status: TransportedDataStatus.Done,
          data: res.response,
        });
      } else {
        replaceNewLandSubmission({
          status: TransportedDataStatus.Done,
          data: undefined,
        });

        replaceNewLandName('');

        await fetchLands();
      }
    }
  };

  useEffect(() => {
    (async () => {
      await Promise.all([fetchLands(), fetchLandsToClaim()]);
    })();
  }, []);

  return (
    <Layout title={LANDS_ROUTE.label}>
      {() => (
        <>
          <h1>Lands</h1>
          <Toast
            className="bg-success w-100 mb-4"
            show={
              new URLSearchParams(window.location.search).get('deleted') ===
              'true'
            }
            delay={10000}
            autohide
          >
            <Toast.Header closeButton={false}>Land was deleted</Toast.Header>
          </Toast>
          <div className="my-3">
            <TransportedDataGate dataWrapper={landsToClaim}>
              {({ data }) => {
                return data.free === 0 ? (
                  <div className="bg-warning p-3">
                    {START_LANDS_LIMIT_EXCEEDED_MESSAGE}
                  </div>
                ) : (
                  <div className="bg-info p-3">
                    8Land has {data.free} lands available for building.
                    <br />
                    We will keep raising the amount of available lands as we
                    grow.
                  </div>
                );
              }}
            </TransportedDataGate>
          </div>
          <TransportedDataGate dataWrapper={newLandSubmission}>
            {({ data }) => {
              return (
                <div className="input-group mb-3">
                  <input
                    type="text"
                    value={newLandName}
                    onChange={(e) => replaceNewLandName(e.target.value)}
                    placeholder="New land name"
                    id="add-land-name-input"
                    className={`form-control ${data ? 'is-invalid' : ''}`}
                  />
                  <button
                    disabled={!newLandName.trim()}
                    onClick={addLand}
                    className="btn btn-success"
                    type="button"
                    id="button-addon2"
                  >
                    Add Land
                  </button>

                  {data?.error === 'name-already-taken' ? (
                    <div className="invalid-feedback">
                      This name is already taken
                    </div>
                  ) : null}
                  {data?.error === 'lands-limit-exceeded' ? (
                    <div className="invalid-feedback">
                      You cannot have more than {data.limit} lands
                    </div>
                  ) : null}
                  {data?.error ===
                  'cannot-create-more-lands-without-start-block' ? (
                    <div className="invalid-feedback">
                      Before you can create any more lands, you need to upload a
                      tileset and a map with a start block in your first land,
                      for the player to enter and navigate your lands
                    </div>
                  ) : null}
                </div>
              );
            }}
          </TransportedDataGate>
          <hr />
          <TransportedDataGate dataWrapper={lands}>
            {({ data }) => {
              return (
                <div className="list-group">
                  {data.lands.map((land) => {
                    return (
                      <LinkAnchor
                        href={EDIT_LAND_ROUTE.getHref(land.id)}
                        key={land.id}
                        className="list-group-item d-flex justify-content-between"
                      >
                        <span>{land.name}</span>{' '}
                        {land.published ? (
                          <span className="badge bg-success">Published</span>
                        ) : null}
                        {land.isStartingLand ? (
                          <span className="badge bg-info">Start</span>
                        ) : null}
                      </LinkAnchor>
                    );
                  })}
                </div>
              );
            }}
          </TransportedDataGate>
        </>
      )}
    </Layout>
  );
}
