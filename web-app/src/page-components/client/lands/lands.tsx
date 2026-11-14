import React from 'react';
import { IndexLandsDTO, GetLandsToClaimDTO } from '../../../api/routes/lands/lands-api';
import { useEffect, useState } from 'react';
import {
  FaExclamationCircle,
  FaWifi,
} from 'react-icons/fa';
import { RouteComponentProps } from '@reach/router';
import { Logger, useLogger } from '../../../logging/logger';
import { ApiFetchErrors } from '../../../api/fetch-errors';
import { Layout } from '../../layout/layout';
import { LinkAnchor } from '../../../ui/link-anchor';
import { EDIT_LAND_ROUTE } from './edit/edit-land-routes';
import { useLandsAPI } from '../../../api/routes/lands/lands-api';
import { Toast } from 'react-bootstrap';
import { START_LANDS_LIMIT_EXCEEDED_MESSAGE } from './edit/assets-section/assets-section-constants';
import { BUILDING_A_LAND_ROUTE } from '../../help/lands/building-a-land/building-a-land-routes';
import { LAND_IDEAS_ROUTE } from '../../help/lands/land-ideas/land-ideas-routes';

export function Lands(_props: RouteComponentProps) {
  const api = useLandsAPI();
  const logger = useLogger();

  const [newLandName, replaceNewLandName] = useState('');

  const [newLandSubmission, replaceNewLandSubmission] = useState<{
    loading?: boolean;
    error?: ApiFetchErrors;
    data?:
      | undefined
      | { error: 'name-already-taken' }
      | { error: 'lands-limit-exceeded'; limit: number }
      | { error: 'cannot-create-more-lands-without-start-block' };
  }>({});

  const [landsToClaim, replaceLandsToClaim] = useState<{
    loading?: boolean;
    error?: ApiFetchErrors;
    data?: GetLandsToClaimDTO;
  }>({});

  const [lands, replaceLands] = useState<{
    loading?: boolean;
    error?: ApiFetchErrors;
    data?: IndexLandsDTO;
  }>({});

  const fetchLands = async () => {
    replaceLands({ loading: true });

    const res = await api.getLandsIndex();

    if (res.error) {
      replaceLands({
        error: res.error,
      });
    } else {
      if (res.response.body.total > res.response.body.limit) {
        logger.logException('lands-page-needs-pagination', new Error());

        window.alert('Lands page needs pagination');

        replaceLands({
          error: ApiFetchErrors.UnexpectedResponse,
        });
      } else {
        replaceLands({
          data: res.response.body,
        });
      }
    }
  };

  const fetchLandsToClaim = async () => {
    replaceLandsToClaim({ loading: true });

    const res = await api.getLandsToClaim();

    if (res.error) {
      replaceLandsToClaim({
        error: res.error,
      });
    } else {
      replaceLandsToClaim({
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

    replaceNewLandSubmission({ loading: true });

    const res = await api.createLand({ name: newLandName });

    if (res.error) {
      replaceNewLandSubmission({
        error: res.error,
      });
    } else {
      if (res.response.error) {
        replaceNewLandSubmission({
          data: res.response,
        });
      } else {
        replaceNewLandSubmission({});

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
            <div className=" col-12 col-md-6">
              {landsToClaim.loading && landsToClaim.data === undefined ? (
                <div className="d-flex flex-column justify-content-center align-items-center">
                  <div
                    className="d-block spinner-lg spinner-border text-primary"
                    role="status"
                  >
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : null}
              {landsToClaim.loading && landsToClaim.data !== undefined ? (
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
              {landsToClaim.error === ApiFetchErrors.ConnectionFailure ? (
                <div className="d-flex flex-column justify-content-center align-items-center">
                  <FaWifi
                    className="text-danger"
                    style={{ fontSize: '2rem' }}
                  />
                  <p className="mt-3 text-center text-danger mb-0">
                    No Internet. Check your connection and try again.
                  </p>
                </div>
              ) : landsToClaim.error === ApiFetchErrors.Aborted ? (
                <div className="d-flex flex-column justify-content-center align-items-center">
                  <p className="mt-3 text-center mb-0">Redirecting...</p>
                </div>
              ) : landsToClaim.error === ApiFetchErrors.UnexpectedResponse ? (
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
              {landsToClaim.data !== undefined && !landsToClaim.error ? (
                landsToClaim.data.free === 0 ? (
                  <div className="bg-warning p-3">
                    {START_LANDS_LIMIT_EXCEEDED_MESSAGE}
                  </div>
                ) : (
                  <div className="bg-info p-3">
                    8Land has {landsToClaim.data.free} lands available for
                    building.
                    <br />
                    We will keep raising the amount of available lands as we
                    grow.
                  </div>
                )
              ) : null}
            </div>
          </div>
          <div className=" ">
            {newLandSubmission.loading && newLandSubmission.data === undefined ? (
              <div className="d-flex flex-column justify-content-center align-items-center">
                <div
                  className="d-block spinner-lg spinner-border text-primary"
                  role="status"
                >
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : null}
            {newLandSubmission.loading && newLandSubmission.data !== undefined ? (
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
            {newLandSubmission.error === ApiFetchErrors.ConnectionFailure ? (
              <div className="d-flex flex-column justify-content-center align-items-center">
                <FaWifi className="text-danger" style={{ fontSize: '2rem' }} />
                <p className="mt-3 text-center text-danger mb-0">
                  No Internet. Check your connection and try again.
                </p>
              </div>
            ) : newLandSubmission.error === ApiFetchErrors.Aborted ? (
              <div className="d-flex flex-column justify-content-center align-items-center">
                <p className="mt-3 text-center mb-0">Redirecting...</p>
              </div>
            ) : newLandSubmission.error === ApiFetchErrors.UnexpectedResponse ? (
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
            {!newLandSubmission.loading && !newLandSubmission.error ? (
              <div className="input-group mb-3">
                <input
                  type="text"
                  value={newLandName}
                  onChange={(e) => replaceNewLandName(e.target.value)}
                  placeholder="New land name"
                  id="add-land-name-input"
                  className={`form-control ${
                    newLandSubmission.data ? 'is-invalid' : ''
                  }`}
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

                {newLandSubmission.data?.error === 'name-already-taken' ? (
                  <div className="invalid-feedback">
                    This name is already taken
                  </div>
                ) : null}
                {newLandSubmission.data?.error === 'lands-limit-exceeded' ? (
                  <div className="invalid-feedback">
                    You cannot have more than {newLandSubmission.data.limit}{' '}
                    lands
                  </div>
                ) : null}
                {newLandSubmission.data?.error ===
                'cannot-create-more-lands-without-start-block' ? (
                  <div className="invalid-feedback">
                    Before you can create any more lands, you need to upload a
                    tileset and a map with a start block in your first land, so
                    the player can enter and navigate your many lands
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
          <hr />
          <div className=" ">
            {lands.loading && lands.data === undefined ? (
              <div className="d-flex flex-column justify-content-center align-items-center">
                <div
                  className="d-block spinner-lg spinner-border text-primary"
                  role="status"
                >
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : null}
            {lands.loading && lands.data !== undefined ? (
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
            {lands.error === ApiFetchErrors.ConnectionFailure ? (
              <div className="d-flex flex-column justify-content-center align-items-center">
                <FaWifi className="text-danger" style={{ fontSize: '2rem' }} />
                <p className="mt-3 text-center text-danger mb-0">
                  No Internet. Check your connection and try again.
                </p>
              </div>
            ) : lands.error === ApiFetchErrors.Aborted ? (
              <div className="d-flex flex-column justify-content-center align-items-center">
                <p className="mt-3 text-center mb-0">Redirecting...</p>
              </div>
            ) : lands.error === ApiFetchErrors.UnexpectedResponse ? (
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
            {lands.data !== undefined && !lands.error ? (
              <div className="list-group">
                {lands.data.lands.map((land) => {
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
            ) : null}
          </div>
        </>
      )}
    </Layout>
  );
}
