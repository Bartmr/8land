import React, { useEffect, useState } from 'react';
import { Layout } from 'src/components/routing/layout/layout';
import { CLIENT_SIDE_INDEX_ROUTE } from './index-routes';
import { RouteComponentProps } from '@reach/router';
import {
  TransportedData,
  TransportedDataStatus,
} from 'src/logic/app-internals/transports/transported-data/transported-data-types';
import { GetLandDTO } from '@app/shared/land/get/get-land.dto';
import { TransportedDataGate } from 'src/components/shared/transported-data-gate/transported-data-gate';
import { useMainJSONApi } from 'src/logic/app-internals/apis/main/use-main-json-api';
import { ToIndexedType } from '@app/shared/internals/transports/dto-types';
import { mainApiReducer } from 'src/logic/app-internals/apis/main/main-api-reducer';
import { useStoreSelector } from 'src/logic/app-internals/store/use-store-selector';
import { GameFrame } from './components/game-frame';

function Content(props: { showHeader: () => void; hideHeader: () => void }) {
  const api = useMainJSONApi();

  const session = useStoreSelector(
    { mainApi: mainApiReducer },
    (s) => s.mainApi.session,
  );

  const [pressedStart, replacePressedStart] = useState(false);

  const [landToResumeFrom, replaceLandToResumeFrom] = useState<
    TransportedData<GetLandDTO>
  >({ status: TransportedDataStatus.NotInitialized });

  useEffect(() => {
    (async () => {
      replaceLandToResumeFrom({ status: TransportedDataStatus.Loading });

      const res = await api.get<
        { status: 200; body: ToIndexedType<GetLandDTO> },
        undefined
      >({
        path: '/lands/resume',
        query: undefined,
        acceptableStatusCodes: [200],
      });

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
    props.showHeader();
  }, []);

  return (
    <TransportedDataGate dataWrapper={session}>
      {({ data: sessionData }) => (
        <TransportedDataGate dataWrapper={landToResumeFrom}>
          {({ data: landData }) =>
            pressedStart ? (
              <GameFrame session={sessionData} land={landData} />
            ) : (
              <div className="d-flex justify-content-center">
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    props.hideHeader();
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
