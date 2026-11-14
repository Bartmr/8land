import React, { useEffect, useState } from 'react';
import { Layout } from '../../layout/layout';
import { RouteComponentProps } from '@reach/router';
import {
  CommunicatedData,
  CommunicatedDataStatus,
} from '../../../communicated-data/communicated-data-types';
import { CommunicationError } from '../../../communication-errors/communication-errors';
import {
  FaExclamationCircle,
  FaLock,
  FaSearch,
  FaWifi,
} from 'react-icons/fa';
import { GameFrame } from './game-frame';
import { LinkAnchor } from '../../../ui/link-anchor';
import { TERMS_OF_USE_ROUTE } from '../../terms-of-use/terms-of-use-routes';
import { PRIVACY_POLICY_ROUTE } from '../../privacy-policy/privacy-policy-routes';
import { ResumeLandNavigationDTO } from '../../../api/routes/lands/lands-api';
import { useLandsAPI } from '../../../api/routes/lands/lands-api';
import { useAuthenticationStateSession } from '../../../users/authentication/authentication-state';

function Content(props: {
  showHeaderAndFooter: () => void;
  hideHeaderAndFooter: () => void;
}) {
  const api = useLandsAPI();

  const session = useAuthenticationStateSession();

  const [pressedStart, replacePressedStart] = useState(false);

  const [landToResumeFrom, replaceLandToResumeFrom] = useState<
    CommunicatedData<ResumeLandNavigationDTO>
  >({ status: CommunicatedDataStatus.NotInitialized });

  useEffect(() => {
    (async () => {
      replaceLandToResumeFrom({ status: CommunicatedDataStatus.Loading });

      const res = await api.resume();

      if (res.error) {
        replaceLandToResumeFrom({ status: res.error });
      } else {
        replaceLandToResumeFrom({
          status: CommunicatedDataStatus.Done,
          data: res.response.body,
        });
      }
    })();
  }, []);

  useEffect(() => {
    props.showHeaderAndFooter();
  }, []);

  return (
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
        <div className=" ">
          {landToResumeFrom.status === CommunicatedDataStatus.NotInitialized ? null : landToResumeFrom.status === CommunicatedDataStatus.Loading ? (
            <div className="d-flex flex-column justify-content-center align-items-center">
              <div
                className="d-block spinner-lg spinner-border text-primary"
                role="status"
              >
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : landToResumeFrom.status === CommunicatedDataStatus.Refreshing ? (
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
          ) : landToResumeFrom.status === CommunicationError.NotFound ? (
            <div className="d-flex flex-column justify-content-center align-items-center">
              <FaSearch style={{ fontSize: '2rem' }} />
              <p className="mt-3 text-center mb-0">Not Found</p>
            </div>
          ) : landToResumeFrom.status === CommunicationError.ConnectionFailure ? (
            <div className="d-flex flex-column justify-content-center align-items-center">
              <FaWifi className="text-danger" style={{ fontSize: '2rem' }} />
              <p className="mt-3 text-center text-danger mb-0">
                No Internet. Check your connection and try again.
              </p>
            </div>
          ) : landToResumeFrom.status === CommunicationError.Forbidden ? (
            <div className="d-flex flex-column justify-content-center align-items-center">
              <FaLock style={{ fontSize: '2rem' }} />
              <p className="mt-3 text-center mb-0">
                You are not allowed to access this content
              </p>
            </div>
          ) : landToResumeFrom.status === CommunicationError.AbortedAndDealtWith ? (
            <div className="d-flex flex-column justify-content-center align-items-center">
              <p className="mt-3 text-center mb-0">Redirecting...</p>
            </div>
          ) : landToResumeFrom.status === CommunicationError.UnexpectedResponse ? (
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
          {landToResumeFrom.status === CommunicatedDataStatus.Done ||
          landToResumeFrom.status === CommunicatedDataStatus.Refreshing ? (
            pressedStart ? (
              <GameFrame
                session={session.data}
                resumedLand={landToResumeFrom.data}
              />
            ) : (
              <div className="text-center">
                <p>
                  By pressing &quot;Start&quot;, you are agreeing with
                  8Land&apos;s{' '}
                  <LinkAnchor href={TERMS_OF_USE_ROUTE.getHref()}>
                    Terms of Use
                  </LinkAnchor>{' '}
                  and{' '}
                  <LinkAnchor href={PRIVACY_POLICY_ROUTE.getHref()}>
                    Privacy Policy
                  </LinkAnchor>
                </p>
                <button
                  className="mt-5 btn btn-primary"
                  onClick={() => {
                    props.hideHeaderAndFooter();
                    replacePressedStart(true);
                  }}
                >
                  Start
                </button>
              </div>
            )
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export const Index = (_props: RouteComponentProps) => (
  <Layout disableScroll>
    {(renderProps) => {
      return <Content {...renderProps} />;
    }}
  </Layout>
);
