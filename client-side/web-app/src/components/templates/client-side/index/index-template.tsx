import { throwError } from '@app/shared/internals/utils/throw-error';
import React, { useEffect, useState } from 'react';
import { Layout } from 'src/components/routing/layout/layout';
import { CLIENT_SIDE_INDEX_ROUTE } from './index-routes';
import { RouteComponentProps } from '@reach/router';
import { runGame } from './game';
import * as styles from './index.module.scss';
import { missingCssClass } from 'src/components/ui-kit/core/utils/missing-css-class';
import { LinkAnchor } from 'src/components/ui-kit/protons/link-anchor/link-anchor';
import { SoundcloudSong } from './soundcloud-types';
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
import { MainApiSessionData } from 'src/logic/app-internals/apis/main/session/main-api-session-types';

function GameCanvas(props: {
  onSongChange: (song: SoundcloudSong) => void;
  land: GetLandDTO;
  session: null | MainApiSessionData;
  changeLandNameDisplay: (landName: string) => void;
}) {
  const api = useMainJSONApi();

  const [started, replaceStarted] = useState(false);

  useEffect(() => {
    (async () => {
      if (started) return;

      replaceStarted(true);

      let lastSong: string | null;
      let soundcloudPlayerIsReady = false;

      const soundcloudPlayerIframe =
        document.querySelector('#soundcloud-player') || throwError();

      const soundcloudPlayer = window.SC
        ? window.SC.Widget(soundcloudPlayerIframe as HTMLIFrameElement)
        : undefined;

      if (soundcloudPlayer) {
        soundcloudPlayer.bind(
          (window.SC || throwError()).Widget.Events.READY,
          () => {
            soundcloudPlayer.pause();

            if (lastSong && !soundcloudPlayerIsReady) {
              soundcloudPlayer.load(lastSong, {
                callback: () => {
                  soundcloudPlayer.getCurrentSound((s) =>
                    props.onSongChange(s),
                  );
                  soundcloudPlayer.play();
                },
              });
            }

            soundcloudPlayerIsReady = true;
          },
        );

        soundcloudPlayer.bind(
          (window.SC || throwError()).Widget.Events.FINISH,
          () => {
            soundcloudPlayer.seekTo(0);
            soundcloudPlayer.play();

            const gameElement = document.querySelector(
              '#game-root canvas',
            ) as HTMLCanvasElement;

            gameElement.focus();
          },
        );
      }

      // https://soundcloud.com/radion-alexievich-drozdov/spacedandywave?in=eliud-makaveli-zavala/sets/vaporwave
      await runGame(
        { land: props.land, session: props.session },
        {
          api,
          musicProvider: {
            playFromSoundcloud: (url: string | null) => {
              if (soundcloudPlayer) {
                if (url && url !== lastSong) {
                  if (soundcloudPlayerIsReady) {
                    soundcloudPlayer.load(url, {
                      callback: () => {
                        soundcloudPlayer.getCurrentSound((s) =>
                          props.onSongChange(s),
                        );
                        soundcloudPlayer.play();
                      },
                    });
                  }

                  lastSong = url;
                }
              }
            },
          },
          changeLandNameDisplay: props.changeLandNameDisplay,
        },
      );
    })();
  }, []);

  return (
    <>
      <div id="game-root"></div>
      <div style={{ position: 'absolute', top: '-9999px', left: '-9999px' }}>
        <iframe
          title="soundcloud-player"
          id="soundcloud-player"
          width="100%"
          height="166"
          frameBorder="no"
          scrolling="no"
          allow="autoplay"
          src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/189845017"
        ></iframe>
      </div>
    </>
  );
}

function Ticker({ song }: { song: SoundcloudSong }) {
  return (
    <LinkAnchor
      style={{ textDecoration: 'underline' }}
      className="link-unstyled"
      href={song.permalink_url}
    >
      {song.title} - {song.user.username}
    </LinkAnchor>
  );
}

function Game(props: { land: GetLandDTO; session: null | MainApiSessionData }) {
  const [song, replaceSong] = useState<SoundcloudSong | undefined>(undefined);
  const [landName, replaceLandName] = useState<string>('');

  return (
    <div className={styles['gameSize'] || missingCssClass()}>
      <GameCanvas
        session={props.session}
        land={props.land}
        onSongChange={replaceSong}
        changeLandNameDisplay={replaceLandName}
      />
      <div
        className="p-1 bg-secondary d-flex align-items-center"
        style={{ textTransform: 'uppercase' }}
      >
        <span>
          {props.session ? (
            <>You are in: {landName}</>
          ) : (
            'Login in order to save your progress'
          )}
        </span>
      </div>
      <div
        className="mt-2 bg-secondary d-flex align-items-center"
        style={{ textTransform: 'uppercase' }}
      >
        <span className="p-1 bg-secondary">Now playing: </span>

        {song ? (
          <div
            style={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            <Ticker song={song} />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function Content() {
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

  return (
    <TransportedDataGate dataWrapper={session}>
      {({ data: sessionData }) => (
        <TransportedDataGate dataWrapper={landToResumeFrom}>
          {({ data: landData }) =>
            pressedStart ? (
              <Game session={sessionData} land={landData} />
            ) : (
              <div className="d-flex justify-content-center">
                <button
                  className="btn btn-primary"
                  onClick={() => replacePressedStart(true)}
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
  <Layout title={CLIENT_SIDE_INDEX_ROUTE.label}>
    {() => {
      return <Content />;
    }}
  </Layout>
);
