import React, { useEffect, useState } from 'react';
import { Layout } from '../../layout/layout';
import { RouteComponentProps } from '@reach/router';
import {
  CommunicatedData,
  CommunicatedDataStatus,
} from '../../../communicated-data/communicated-data-types';
import { CommunicatedDataGate } from '../../../ui/communicated-data-gate';
import { GameFrame } from './game-frame';
import { LinkAnchor } from '../../../ui/link-anchor';
import { TERMS_OF_USE_ROUTE } from '../../terms-of-use/terms-of-use-routes';
import { PRIVACY_POLICY_ROUTE } from '../../privacy-policy/privacy-policy-routes';
import { ResumeLandNavigationDTO } from '../../../main-api/routes/lands/lands.dtos';
import { useLandsAPI } from '../../../main-api/routes/lands/lands-api';
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
    <CommunicatedDataGate dataWrapper={session}>
      {({ data: sessionData }) => (
        <CommunicatedDataGate dataWrapper={landToResumeFrom}>
          {({ data: landData }) =>
            pressedStart ? (
              <GameFrame session={sessionData} resumedLand={landData} />
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
          }
        </CommunicatedDataGate>
      )}
    </CommunicatedDataGate>
  );
}

export const ClientSideIndexTemplate = (_props: RouteComponentProps) => (
  <Layout disableScroll>
    {(renderProps) => {
      return <Content {...renderProps} />;
    }}
  </Layout>
);
