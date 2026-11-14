import React from 'react';
import { RouteComponentProps } from '@reach/router';
import { useState } from 'react';
import { Layout } from '../../layout/layout';
import {
  CommunicatedData,
  CommunicatedDataStatus,
} from '../../../communicated-data/communicated-data-types';
import { CommunicationError } from '../../../communication-errors/communication-errors';
import { ChangeEmail } from './components/change-email';
import { FaPersonThroughWindow } from 'react-icons/fa6';
import {
  FaExclamationCircle,
  FaLock,
  FaSearch,
  FaWifi,
} from 'react-icons/fa';
import { useLandsAPI } from '../../../api/routes/lands/lands-api';
import { useAuthAPI } from '../../../api/routes/users/auth/auth-api';
import { useAuthenticationLogout } from '../../../users/authentication/logout';
import { useAuthenticationStateSession } from '../../../users/authentication/authentication-state';



export function User(_props: RouteComponentProps) {
  const [escapeStatus, replaceEscapeStatus] = useState<
    CommunicatedData<undefined>
  >({ status: CommunicatedDataStatus.NotInitialized });

  const session = useAuthenticationStateSession();
  const logout = useAuthenticationLogout();

  const landsApi = useLandsAPI();

  const authApi = useAuthAPI();

  const handleEscape = async () => {
    const res = await landsApi.escape();

    if (res.error) {
      replaceEscapeStatus({ status: res.error });
    } else {
      replaceEscapeStatus({
        status: CommunicatedDataStatus.Done,
        data: undefined,
      });
    }
  };

  return (
    <Layout>
      {() => (
        <div className=" ">
          {session.status === CommunicatedDataStatus.NotInitialized ? null : session.status === CommunicatedDataStatus.Loading ? (
            <div className="d-flex flex-column justify-content-center align-items-center">
              <div
                className="d-block spinner-lg spinner-border text-primary"
                role="status"
              >
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : session.status === CommunicatedDataStatus.Refreshing ? (
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
          ) : session.status === CommunicationError.NotFound ? (
            <div className="d-flex flex-column justify-content-center align-items-center">
              <FaSearch style={{ fontSize: '2rem' }} />
              <p className="mt-3 text-center mb-0">Not Found</p>
            </div>
          ) : session.status === CommunicationError.ConnectionFailure ? (
            <div className="d-flex flex-column justify-content-center align-items-center">
              <FaWifi className="text-danger" style={{ fontSize: '2rem' }} />
              <p className="mt-3 text-center text-danger mb-0">
                No Internet. Check your connection and try again.
              </p>
            </div>
          ) : session.status === CommunicationError.Forbidden ? (
            <div className="d-flex flex-column justify-content-center align-items-center">
              <FaLock style={{ fontSize: '2rem' }} />
              <p className="mt-3 text-center mb-0">
                You are not allowed to access this content
              </p>
            </div>
          ) : session.status === CommunicationError.AbortedAndDealtWith ? (
            <div className="d-flex flex-column justify-content-center align-items-center">
              <p className="mt-3 text-center mb-0">Redirecting...</p>
            </div>
          ) : session.status === CommunicationError.UnexpectedResponse ? (
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
          {session.status === CommunicatedDataStatus.Done ||
          session.status === CommunicatedDataStatus.Refreshing ? (
            <>
              <div className="card mb-3">
                <div className="card-body row g-2 justify-content-end">
                  <div className="col-auto">
                    <button
                      onClick={() => logout()}
                      className="btn btn-secondary"
                    >
                      Log out
                    </button>
                  </div>
                  <div className="col-auto">
                    <button
                      onClick={async () => {
                        await authApi.logoutFromAllDevices();
                      }}
                      className="btn btn-secondary"
                    >
                      Log out from all devices
                    </button>
                  </div>
                </div>
              </div>
              <div className="my-3 card">
                <div className="card-body">
                  <h2 id="escape" className="card-title h3">
                    Escape
                  </h2>
                  <p>
                    If you are having trouble leaving a land, you can teleport
                    yourself escape to a safe place, like the trains station, by
                    clicking the button below
                  </p>
                  <div className="d-flex align-items-center">
                    <button
                      onClick={handleEscape}
                      disabled={
                        escapeStatus.status === CommunicatedDataStatus.Loading
                      }
                      className="btn btn-danger"
                    >
                      <FaPersonThroughWindow /> Escape
                    </button>
                    <div className="ms-3">
                      <div
                        className={
                          escapeStatus.status ===
                          CommunicatedDataStatus.Refreshing
                            ? 'd-flex flex-row align-items-center'
                            : ' '
                        }
                      >
                        {escapeStatus.status === CommunicatedDataStatus.NotInitialized ? null : escapeStatus.status === CommunicatedDataStatus.Loading ? (
                          <div className="d-flex flex-row justify-content-center align-items-center">
                            <div
                              className="d-block spinner-sm spinner-border text-primary"
                              role="status"
                            >
                              <span className="visually-hidden">Loading...</span>
                            </div>
                          </div>
                        ) : escapeStatus.status === CommunicatedDataStatus.Refreshing ? (
                          <div style={{ marginRight: 'var(--spacer-2)' }}>
                            <div
                              className="d-block spinner-sm spinner-border text-primary"
                              role="status"
                            >
                              <span className="visually-hidden">Loading...</span>
                            </div>
                          </div>
                        ) : escapeStatus.status === CommunicationError.NotFound ? (
                          <div className="d-flex flex-row justify-content-center align-items-center">
                            <FaSearch />
                            <p className="ms-2 mb-0">Not Found</p>
                          </div>
                        ) : escapeStatus.status === CommunicationError.ConnectionFailure ? (
                          <div className="d-flex flex-row justify-content-center align-items-center">
                            <FaWifi className="text-danger" />
                            <p className="ms-2 text-danger mb-0">No Internet</p>
                          </div>
                        ) : escapeStatus.status === CommunicationError.Forbidden ? (
                          <div className="d-flex flex-row justify-content-center align-items-center">
                            <FaLock />
                            <p className="ms-2 mb-0">Not Allowed</p>
                          </div>
                        ) : escapeStatus.status === CommunicationError.AbortedAndDealtWith ? (
                          <div className="d-flex flex-row justify-content-center align-items-center">
                            <p className="ms-2 mb-0">Redirecting...</p>
                          </div>
                        ) : escapeStatus.status === CommunicationError.UnexpectedResponse ? (
                          <div className="d-flex flex-row justify-content-center align-items-center">
                            <FaExclamationCircle className="text-danger" />
                            <p className="text-danger ms-2 mb-0">
                              Unexpected Error
                            </p>
                          </div>
                        ) : null}
                        {escapeStatus.status === CommunicatedDataStatus.Done ||
                        escapeStatus.status ===
                          CommunicatedDataStatus.Refreshing ? (
                          <span className="text-success">
                            Escape was successful
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-3">
                <ChangeEmail />
              </div>
            </>
          ) : null}
        </div>
      )}
    </Layout>
  );
}
