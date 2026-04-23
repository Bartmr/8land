import React from 'react';
import { RouteComponentProps } from '@reach/router';
import { useState } from 'react';
import { Layout } from '../../layout/layout';
import {
  TransportedDataGate,
  TransportedDataGateLayout,
} from '../../../ui/transported-data-gate';
import { mainApiReducer } from '../../../main-api/main-api-reducer';
import { useUserAuth } from '../../../users/auth/use-user-auth';
import { useStoreSelector } from '../../../redux/use-store-selector';
import {
  TransportedData,
  TransportedDataStatus,
} from '../../../communicated-data/communicated-data-types';
import { useUserAuthLogout } from '../../../users/auth/use-user-auth-logout';
import { ChangeEmail } from './components/change-email';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPersonThroughWindow } from '@fortawesome/free-solid-svg-icons';
import { useLandsAPI } from '../../../main-api/routes/lands/lands-api';
import { useAuthAPI } from '../../../main-api/routes/users/auth/auth.api';



export function UserTemplate(_props: RouteComponentProps) {
  const [escapeStatus, replaceEscapeStatus] = useState<
    TransportedData<undefined>
  >({ status: TransportedDataStatus.NotInitialized });

  const mainApiSession = useUserAuth();
  const session = useStoreSelector(
    { mainApi: mainApiReducer },
    (s) => s.mainApi.session,
  );
  const logout = useUserAuthLogout();

  const landsApi = useLandsAPI();

  const authApi = useAuthAPI();

  const handleEscape = async () => {
    const res = await landsApi.escape();

    if (res.error) {
      replaceEscapeStatus({ status: res.error });
    } else {
      replaceEscapeStatus({
        status: TransportedDataStatus.Done,
        data: undefined,
      });
    }
  };

  return (
    <Layout>
      {() => (
        <TransportedDataGate
          dataWrapper={
            session.status === TransportedDataStatus.Refreshing
              ? { status: TransportedDataStatus.Loading }
              : session
          }
        >
          {({ data: sessionData }) => (
            <>
              <div className="card mb-3">
                <div className="card-body row g-2 justify-content-end">
                  <div className="col-auto">
                    <button
                      onClick={() => logout.logout()}
                      className="btn btn-secondary"
                    >
                      Log out
                    </button>
                  </div>
                  <div className="col-auto">
                    <button
                      onClick={() => authApi.logoutFromAllDevices()}
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
                    yourself back to a safe place, like the trains station, by
                    clicking the button below
                  </p>
                  <div className="d-flex align-items-center">
                    <button
                      onClick={handleEscape}
                      disabled={
                        escapeStatus.status === TransportedDataStatus.Loading
                      }
                      className="btn btn-danger"
                    >
                      <FontAwesomeIcon icon={faPersonThroughWindow} /> Escape
                    </button>
                    <div className="ms-3">
                      <TransportedDataGate
                        layout={TransportedDataGateLayout.Tape}
                        dataWrapper={escapeStatus}
                      >
                        {() => (
                          <span className="text-success">
                            Escape was successful
                          </span>
                        )}
                      </TransportedDataGate>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-3">
                <ChangeEmail />
              </div>
            </>
          )}
        </TransportedDataGate>
      )}
    </Layout>
  );
}
