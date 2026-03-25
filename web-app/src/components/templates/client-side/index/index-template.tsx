import React, { useEffect, useState } from 'react';
import { Layout } from 'src/components/routing/layout/layout';
import { CLIENT_SIDE_INDEX_ROUTE } from './index-routes';
import { RouteComponentProps } from '@reach/router';
import {
  TransportedData,
  TransportedDataStatus,
} from 'src/logic/app-internals/transports/transported-data/transported-data-types';
import { TransportedDataGate } from 'src/components/shared/transported-data-gate/transported-data-gate';
import { mainApiReducer } from 'src/logic/app-internals/apis/main/main-api-reducer';
import { useStoreSelector } from 'src/logic/app-internals/store/use-store-selector';
import { GameFrame } from './components/game-frame';
import { LinkAnchor } from 'src/components/ui-kit/protons/link-anchor/link-anchor';
import { TERMS_OF_USE_ROUTE } from '../../terms-of-use/terms-of-use-routes';
import { PRIVACY_POLICY_ROUTE } from '../../privacy-policy/privacy-policy-routes';
import { ResumeLandNavigationDTO } from '@app/shared/land/in-game/resume/resume-land-navigation.dto';
import { useLandsAPI } from 'src/logic/lands/lands-api';

function Content(props: {
  showHeaderAndFooter: () => void;
  hideHeaderAndFooter: () => void;
}) {
  const api = useLandsAPI();

  const session = useStoreSelector(
    { mainApi: mainApiReducer },
    (s) => s.mainApi.session,
  );

  const [pressedStart, replacePressedStart] = useState(false);

  const [landToResumeFrom, replaceLandToResumeFrom] = useState<
    TransportedData<ResumeLandNavigationDTO>
  >({ status: TransportedDataStatus.NotInitialized });

  useEffect(() => {
    (async () => {
      replaceLandToResumeFrom({ status: TransportedDataStatus.Loading });

      const res = await api.resume();

      if (res.failure) {
        replaceLandToResumeFrom({ status: res.failure });
      } else {
        replaceLandToResumeFrom({
          status: TransportedDataStatus.Done,
          data: res.response.body,
        });
      }
    })();
  }, []);

  useEffect(() => {
    props.showHeaderAndFooter();
  }, []);

  return (
    <TransportedDataGate dataWrapper={session}>
      {({ data: sessionData }) => (
        <TransportedDataGate dataWrapper={landToResumeFrom}>
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
        </TransportedDataGate>
      )}
    </TransportedDataGate>
  );
}

export const ClientSideIndexTemplate = (_props: RouteComponentProps) => (
  <Layout disableScroll title={CLIENT_SIDE_INDEX_ROUTE.label}>
    {(renderProps) => {
      return <Content {...renderProps} />;
    }}
  </Layout>
);
