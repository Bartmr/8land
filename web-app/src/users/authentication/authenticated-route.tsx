import React, { ReactNode, useContext } from 'react';
import { Redirect } from '../../navigation/redirect/redirect';
import { LOGIN_ROUTE } from '../../page-components/client/login/login-routes';
import { getCurrentLocalHref } from '../../navigation/current-local-href';
import { useLocation } from '@reach/router';
import { AuthenticationStateContext } from './authentication-state';
import { throwError } from '../../throw-error';
import { CommunicationError } from '../../communication-errors/communication-errors';
import {
  FaExclamationCircle,
  FaWifi,
} from 'react-icons/fa';

type Props = {
  children: ReactNode;
  // For react-router
  path: string;
};

export const AuthenticatedRoute = (props: Props) => {
  const location = useLocation();

  const { sessionState } = useContext(AuthenticationStateContext) || throwError();

  if (typeof sessionState.data === 'undefined') {
    if (sessionState.error) {
      return (
        <div className=" py-3">
          {sessionState.error === CommunicationError.ConnectionFailure ? (
            <div className="d-flex flex-column justify-content-center align-items-center">
              <FaWifi className="text-danger" style={{ fontSize: '2rem' }} />
              <p className="mt-3 text-center text-danger mb-0">
                No Internet. Check your connection and try again.
              </p>
            </div>
          ) : sessionState.error === CommunicationError.AbortedAndDealtWith ? (
            <div className="d-flex flex-column justify-content-center align-items-center">
              <p className="mt-3 text-center mb-0">Redirecting...</p>
            </div>
          ) : sessionState.error === CommunicationError.UnexpectedResponse ? (
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
        </div>
      );
    } else {
      return (
        <div className=" py-3">
          <div className="d-flex flex-column justify-content-center align-items-center">
            <div
              className="d-block spinner-lg spinner-border text-primary"
              role="status"
            >
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      );
    }

  } else {
    const session = sessionState.data;

    if (session) {
      return <>{props.children}</>;
    } else {
      return (
        <Redirect
          href={
            LOGIN_ROUTE.getHref({ next: getCurrentLocalHref() })
          }
        />
      );
    }

  }
};
