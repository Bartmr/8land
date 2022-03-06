import { throwError } from '@app/shared/internals/utils/throw-error';
import { useEffect, useState } from 'react';
import { LinkAnchor } from 'src/components/ui-kit/protons/link-anchor/link-anchor';
import { SoundcloudSong } from '../../soundcloud-types';

export function MusicTicker(props: { musicUrl: string | null }) {
  const [lastMusicUrl, replaceLastMusicUrl] = useState<string | undefined>(
    undefined,
  );
  const [song, replaceSong] = useState<SoundcloudSong | undefined>();
  const [soundcloudPlayer, replaceSoundcloudPlayer] = useState<
    ReturnType<NonNullable<typeof window['SC']>['Widget']> | undefined
  >();

  useEffect(() => {
    const soundcloudPlayerIframe =
      document.querySelector('#soundcloud-player') || throwError();

    const sP = window.SC
      ? window.SC.Widget(soundcloudPlayerIframe as HTMLIFrameElement)
      : undefined;

    if (sP) {
      const onReady = () => {
        sP.pause();

        replaceSoundcloudPlayer(sP);

        sP.unbind((window.SC || throwError()).Widget.Events.READY);
      };
      sP.bind((window.SC || throwError()).Widget.Events.READY, onReady);

      sP.bind((window.SC || throwError()).Widget.Events.FINISH, () => {
        sP.seekTo(0);
        sP.play();

        const gameElement = document.querySelector(
          '#game-root canvas',
        ) as HTMLCanvasElement;

        gameElement.focus();
      });
    }
  }, []);

  useEffect(() => {
    if (soundcloudPlayer) {
      if (props.musicUrl && props.musicUrl !== lastMusicUrl) {
        soundcloudPlayer.load(props.musicUrl, {
          callback: () => {
            soundcloudPlayer.getCurrentSound((s) => replaceSong(s));
            soundcloudPlayer.play();
          },
        });

        replaceLastMusicUrl(props.musicUrl);
      }
    }
  }, [props.musicUrl, soundcloudPlayer]);

  return (
    <>
      <div
        style={{
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {song ? (
          <LinkAnchor
            style={{ textDecoration: 'underline' }}
            className="link-unstyled"
            href={song.permalink_url}
          >
            {song.title} - {song.user.username}
          </LinkAnchor>
        ) : null}
      </div>

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
