import React, { useEffect, useState } from 'react';
import { Layout } from '../../layout/layout';
import { RouteComponentProps } from '@reach/router';
import {
  TransportedData,
  TransportedDataStatus,
} from '../../../communicated-data/communicated-data-types';
import { TransportedDataGate } from '../../../ui/transported-data-gate';
import { mainApiReducer } from '../../../main-api/main-api-reducer';
import { useStoreSelector } from '../../../redux/use-store-selector';
import { GameFrame } from './game-frame';
import { LinkAnchor } from '../../../ui/link-anchor';
import { TERMS_OF_USE_ROUTE } from '../../terms-of-use/terms-of-use-routes';
import { PRIVACY_POLICY_ROUTE } from '../../privacy-policy/privacy-policy-routes';
import { ResumeLandNavigationDTO } from '../../../main-api/routes/lands/lands.dtos';
import { useLandsAPI } from '../../../main-api/routes/lands/lands-api';

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
  <Layout disableScroll>
    {(renderProps) => {
      return <Content {...renderProps} />;
    }}
  </Layout>
);
