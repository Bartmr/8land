import React, { useEffect, useState } from 'react';
import { Layout } from '../../layout/layout';
import { RouteComponentProps } from '@reach/router';
import { ApiFetchErrors } from '../../../api/fetch-errors';
import {
  FaExclamationCircle,
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

  const [landToResumeFrom, replaceLandToResumeFrom] = useState<{
    loading?: boolean;
    error?: ApiFetchErrors;
    data?: ResumeLandNavigationDTO;
  }>({});

  useEffect(() => {
    (async () => {
      replaceLandToResumeFrom({ loading: true });

      const res = await api.resume();

      if (res.error) {
        replaceLandToResumeFrom({ error: res.error });
      } else {
        replaceLandToResumeFrom({
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
      {session.loading && session.data === undefined ? (
        <div className="d-flex flex-column justify-content-center align-items-center">
          <div
            className="d-block spinner-lg spinner-border text-primary"
            role="status"
          >
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : null}
      {session.loading && session.data !== undefined ? (
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
      {session.error === ApiFetchErrors.ConnectionFailure ? (
        <div className="d-flex flex-column justify-content-center align-items-center">
          <FaWifi className="text-danger" style={{ fontSize: '2rem' }} />
          <p className="mt-3 text-center text-danger mb-0">
            No Internet. Check your connection and try again.
          </p>
        </div>
      ) : session.error === ApiFetchErrors.AbortedAndDealtWith ? (
        <div className="d-flex flex-column justify-content-center align-items-center">
          <p className="mt-3 text-center mb-0">Redirecting...</p>
        </div>
      ) : session.error === ApiFetchErrors.UnexpectedResponse ? (
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
      {session.data !== undefined && !session.error ? (
        <div className=" ">
          {landToResumeFrom.loading && landToResumeFrom.data === undefined ? (
            <div className="d-flex flex-column justify-content-center align-items-center">
              <div
                className="d-block spinner-lg spinner-border text-primary"
                role="status"
              >
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : null}
          {landToResumeFrom.loading && landToResumeFrom.data !== undefined ? (
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
          {landToResumeFrom.error === ApiFetchErrors.ConnectionFailure ? (
            <div className="d-flex flex-column justify-content-center align-items-center">
              <FaWifi className="text-danger" style={{ fontSize: '2rem' }} />
              <p className="mt-3 text-center text-danger mb-0">
                No Internet. Check your connection and try again.
              </p>
            </div>
          ) : landToResumeFrom.error === ApiFetchErrors.AbortedAndDealtWith ? (
            <div className="d-flex flex-column justify-content-center align-items-center">
              <p className="mt-3 text-center mb-0">Redirecting...</p>
            </div>
          ) : landToResumeFrom.error === ApiFetchErrors.UnexpectedResponse ? (
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
          {landToResumeFrom.data !== undefined && !landToResumeFrom.error ? (
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
