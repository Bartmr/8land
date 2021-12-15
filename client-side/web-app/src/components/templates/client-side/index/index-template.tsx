import { throwError } from '@app/shared/internals/utils/throw-error';
import React, { useEffect, useState } from 'react';
import { Layout } from 'src/components/routing/layout/layout';
import { CLIENT_SIDE_INDEX_ROUTE } from './index-routes';
import { RouteComponentProps } from '@reach/router';
import { runGame } from './game';

function Game() {
  const [started, replaceStarted] = useState(false);

  useEffect(() => {
    (async () => {
      if (started) return;

      replaceStarted(true);

      const soundcloudPlayer = window.SC
        ? window.SC.Widget('soundcloud-player')
        : undefined;

      if (soundcloudPlayer) {
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

      let lastSong: string | null;

      // https://soundcloud.com/radion-alexievich-drozdov/spacedandywave?in=eliud-makaveli-zavala/sets/vaporwave
      await runGame({
        musicProvider: {
          playFromSoundcloud: (url: string | null) => {
            if (soundcloudPlayer) {
              if (url && url !== lastSong) {
                soundcloudPlayer.load(url, { auto_play: true });
                lastSong = url;
              }
            }
          },
        },
      });
    })();
  }, []);

  return (
    <div className="row justify-content-center">
      <div className="col-12 col-md-9 col-lg-6">
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
      </div>
    </div>
  );
}

function Content() {
  const [pressedStart, replacePressedStart] = useState(false);

  return pressedStart ? (
    <Game />
  ) : (
    <div className="d-flex justify-content-center">
      <button
        className="btn btn-primary"
        onClick={() => replacePressedStart(true)}
      >
        Start
      </button>
    </div>
  );
}

export const ClientSideIndexTemplate = (_props: RouteComponentProps) => (
  <Layout title={CLIENT_SIDE_INDEX_ROUTE.label}>
    {() => {
      return <Content />;
    }}
  </Layout>
);