import { throwError } from '@app/shared/internals/utils/throw-error';
import React, { useEffect, useState } from 'react';
import { Layout } from 'src/components/routing/layout/layout';
import { INDEX_ROUTE } from './index-routes';

function Game() {
  const [started, replaceStarted] = useState(false);

  useEffect(() => {
    (async () => {
      if (started) {
        if (module.hot) {
          import('./game');
        }
      } else {
        replaceStarted(true);

        const { runGame } = await import('./game');

        const soundcloudPlayer = window.SC
          ? window.SC.Widget('soundcloud-player')
          : undefined;

        if (soundcloudPlayer) {
          soundcloudPlayer.bind(
            (window.SC || throwError()).Widget.Events.FINISH,
            () => {
              soundcloudPlayer.seekTo(0);
              soundcloudPlayer.play();
            },
          );
        }

        // https://soundcloud.com/radion-alexievich-drozdov/spacedandywave?in=eliud-makaveli-zavala/sets/vaporwave
        await runGame({
          musicProvider: {
            playFromSoundcloud: (url: string) => {
              if (soundcloudPlayer) {
                soundcloudPlayer.load(url, { auto_play: true });
              }
            },
          },
        });
      }
    })();
  });

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

export const IndexTemplate = () => (
  <Layout title={INDEX_ROUTE.label}>
    {() => {
      return <Content />;
    }}
  </Layout>
);
