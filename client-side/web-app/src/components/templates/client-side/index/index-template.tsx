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
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMusic } from '@fortawesome/free-solid-svg-icons';
import { LOGIN_ROUTE } from '../login/login-routes';
import nipplejs from 'nipplejs';
import { JoystickSingleton } from './joystick-singleton';
import { Direction } from './grid.types';
import { getCurrentLocalHref } from 'src/logic/app-internals/navigation/get-current-local-href';

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
      const nippleZone = document.querySelector('#game-nipple') || throwError();

      if (!(nippleZone instanceof HTMLElement)) {
        throwError();
      }
      const nipple = nipplejs.create({
        zone: nippleZone,
      });

      const joystick = JoystickSingleton.getInstance() || throwError();

      nipple.on('dir:up', () => {
        joystick.setDirection(Direction.UP);
      });

      nipple.on('dir:down', () => {
        joystick.setDirection(Direction.DOWN);
      });

      nipple.on('dir:left', () => {
        joystick.setDirection(Direction.LEFT);
      });

      nipple.on('dir:right', () => {
        joystick.setDirection(Direction.RIGHT);
      });

      nipple.on('end', () => {
        joystick.setDirection(Direction.NONE);
      });

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
      const game = await runGame(
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

      return () => {
        if (!module.hot) {
          game.destroy(true);
          nipple.destroy();
        }
      };
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
        className={`p-1 bg-${
          props.session ? 'secondary' : 'warning'
        } d-flex align-items-center`}
        style={{ textTransform: 'uppercase' }}
      >
        <span
          style={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {props.session ? (
            <>{landName}</>
          ) : (
            <LinkAnchor
              href={LOGIN_ROUTE.getHref({ next: getCurrentLocalHref() })}
            >
              Login in to save your progress
            </LinkAnchor>
          )}
        </span>
      </div>
      <div
        className="mt-2 bg-secondary d-flex align-items-center"
        style={{ textTransform: 'uppercase' }}
      >
        <span
          className="py-1 px-2 bg-secondary"
          style={{ whiteSpace: 'nowrap' }}
        >
          <FontAwesomeIcon icon={faMusic} />
        </span>

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
      <div className="d-xl-none me-3 mt-3 d-flex flex-row-reverse">
        <div
          style={{ position: 'absolute', width: '100px', height: '100px' }}
          id="game-nipple"
        ></div>
        <div
          style={{ width: '100px', height: '100px' }}
          className="bg-light d-flex align-items-center justify-content-center text-center small"
        >
          DRAG HERE
          <br />
          TO MOVE
        </div>
      </div>
      <div className="d-none d-xl-block mt-3">
        Instructions: Use the arrow keys to move
      </div>
    </div>
  );
}

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
              <Game session={sessionData} land={landData} />
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
