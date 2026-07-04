import React from 'react';
import { RouteComponentProps } from '@reach/router';
import { useState } from 'react';
import { Layout } from '../../layout/layout';
import {
  CommunicatedDataGate,
  CommunicatedDataGateLayout,
} from '../../ui/communicated-data-gate';
import {
  CommunicatedData,
  CommunicatedDataStatus,
} from '../../communicated-data/communicated-data-types';
import { ChangeEmail } from './components/change-email';
import { FaPersonThroughWindow } from 'react-icons/fa6';
import { useLandsAPI } from '../../main-api/routes/lands/lands-api';
import { useAuthAPI } from '../../main-api/routes/users/auth/auth.api';
import { useAuthenticationLogout } from '../../users/authentication/logout';
import { useAuthenticationStateSession } from '../../users/authentication/authentication-state';



export function UserTemplate(_props: RouteComponentProps) {
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
        <CommunicatedDataGate
          dataWrapper={
            session
          }
        >
          {({ data: sessionData }) => (
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
                      <CommunicatedDataGate
                        layout={CommunicatedDataGateLayout.Tape}
                        dataWrapper={escapeStatus}
                      >
                        {() => (
                          <span className="text-success">
                            Escape was successful
                          </span>
                        )}
                      </CommunicatedDataGate>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-3">
                <ChangeEmail />
              </div>
            </>
          )}
        </CommunicatedDataGate>
      )}
    </Layout>
  );
}
