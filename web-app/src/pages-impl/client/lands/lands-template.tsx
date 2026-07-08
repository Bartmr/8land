import React from 'react';
import { IndexLandsDTO, GetLandsToClaimDTO } from '../../../core/main-api/routes/lands/lands-api';
import { useEffect, useState } from 'react';
import { CommunicatedDataGate } from '../../../core/ui/communicated-data-gate';
import {
  CommunicatedData,
  CommunicatedDataStatus,
} from '../../../core/communicated-data/communicated-data-types';
import { RouteComponentProps } from '@reach/router';
import { Logger } from '../../../core/logging/logger';
import { CommunicationError } from '../../../core/communication-errors/communication-errors';
import { Layout } from '../../layout/layout';
import { LinkAnchor } from '../../../core/ui/link-anchor';
import { EDIT_LAND_ROUTE } from './edit/edit-land-routes';
import { useLandsAPI } from '../../../core/main-api/routes/lands/lands-api';
import { Toast } from 'react-bootstrap';
import { START_LANDS_LIMIT_EXCEEDED_MESSAGE } from './edit/assets-section/assets-section.constants';
import { BUILDING_A_LAND_ROUTE } from '../../help/lands/building-a-land/building-a-land.routes';
import { LAND_IDEAS_ROUTE } from '../../help/lands/land-ideas/land-ideas-routes';

export function LandsTemplate(_props: RouteComponentProps) {
  const api = useLandsAPI();

  const [newLandName, replaceNewLandName] = useState('');

  const [newLandSubmission, replaceNewLandSubmission] = useState<
    CommunicatedData<
      | undefined
      | { error: 'name-already-taken' }
      | { error: 'lands-limit-exceeded'; limit: number }
      | { error: 'cannot-create-more-lands-without-start-block' }
    >
  >({
    status: CommunicatedDataStatus.Done,
    data: undefined,
  });

  const [landsToClaim, replaceLandsToClaim] = useState<
    CommunicatedData<GetLandsToClaimDTO>
  >({
    status: CommunicatedDataStatus.NotInitialized,
  });

  const [lands, replaceLands] = useState<CommunicatedData<IndexLandsDTO>>({
    status: CommunicatedDataStatus.NotInitialized,
  });

  const fetchLands = async () => {
    replaceLands({ status: CommunicatedDataStatus.Loading });

    const res = await api.getLandsIndex();

    if (res.error) {
      replaceLands({
        status: res.error,
      });
    } else {
      if (res.response.body.total > res.response.body.limit) {
        Logger.logError('lands-page-needs-pagination', new Error());

        window.alert('Lands page needs pagination');

        replaceLands({
          status: CommunicationError.UnexpectedResponse,
        });
      } else {
        replaceLands({
          status: CommunicatedDataStatus.Done,
          data: res.response.body,
        });
      }
    }
  };

  const fetchLandsToClaim = async () => {
    replaceLandsToClaim({ status: CommunicatedDataStatus.Loading });

    const res = await api.getLandsToClaim();

    if (res.error) {
      replaceLands({
        status: res.error,
      });
    } else {
      replaceLandsToClaim({
        status: CommunicatedDataStatus.Done,
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

    replaceNewLandSubmission({ status: CommunicatedDataStatus.Loading });

    const res = await api.createLand({ name: newLandName });

    if (res.error) {
      replaceNewLandSubmission({
        status: res.error,
      });
    } else {
      if (res.response.error) {
        replaceNewLandSubmission({
          status: CommunicatedDataStatus.Done,
          data: res.response,
        });
      } else {
        replaceNewLandSubmission({
          status: CommunicatedDataStatus.Done,
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
    <Layout>
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
          <div className="my-3 row g-3">
            <div className="col-12 col-md-6">
              <p>
                <LinkAnchor href={BUILDING_A_LAND_ROUTE.getHref()}>
                  How to build a land?
                </LinkAnchor>
              </p>

              <p>
                <LinkAnchor href={LAND_IDEAS_ROUTE.getHref()}>
                  I need ideas for a land
                </LinkAnchor>
              </p>
            </div>
            <CommunicatedDataGate
              className="col-12 col-md-6"
              dataWrapper={landsToClaim}
            >
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
            </CommunicatedDataGate>
          </div>
          <CommunicatedDataGate dataWrapper={newLandSubmission}>
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
                      so the player can enter and navigate your many lands
                    </div>
                  ) : null}
                </div>
              );
            }}
          </CommunicatedDataGate>
          <hr />
          <CommunicatedDataGate dataWrapper={lands}>
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
                        <div>
                          {land.published ? (
                            <span className="badge bg-success">Published</span>
                          ) : null}
                          {land.isStartingLand ? (
                            <span className="badge bg-info">Start</span>
                          ) : null}
                        </div>
                      </LinkAnchor>
                    );
                  })}
                </div>
              );
            }}
          </CommunicatedDataGate>
        </>
      )}
    </Layout>
  );
}
