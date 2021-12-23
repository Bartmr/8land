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

function GameCanvas(props: { onSongChange: (song: SoundcloudSong) => void }) {
  const [started, replaceStarted] = useState(false);

  useEffect(() => {
    (async () => {
      if (started) return;

      replaceStarted(true);

      const soundcloudPlayerIframe =
        document.querySelector('#soundcloud-player') || throwError();

      const soundcloudPlayer = window.SC
        ? window.SC.Widget(soundcloudPlayerIframe as HTMLIFrameElement)
        : undefined;

      if (soundcloudPlayer) {
        soundcloudPlayer.pause();

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
                soundcloudPlayer.load(url, {
                  callback: () => {
                    soundcloudPlayer.getCurrentSound((s) =>
                      props.onSongChange(s),
                    );
                    soundcloudPlayer.play();
                  },
                });

                lastSong = url;
              }
            }
          },
        },
      });
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

function Game() {
  const [song, replaceSong] = useState<SoundcloudSong | undefined>(undefined);
  return (
    <div className={styles['gameSize'] || missingCssClass()}>
      <GameCanvas onSongChange={replaceSong} />
      <div
        className="bg-secondary d-flex align-items-center"
        style={{ textTransform: 'uppercase' }}
      >
        <span className="p-1 bg-secondary">Now playing: </span>

        {song ? (
          <div>
            <Ticker song={song} />
          </div>
        ) : null}
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
