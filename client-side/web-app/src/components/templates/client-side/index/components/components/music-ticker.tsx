import { throwError } from '@app/shared/internals/utils/throw-error';
import { useEffect, useState } from 'react';
import { LinkAnchor } from 'src/components/ui-kit/protons/link-anchor/link-anchor';
import { v4 } from 'uuid';
import { SoundcloudSong } from '../../soundcloud-types';

export class MusicService {
  lastMusicUrl?: string;
  song?: SoundcloudSong;
  soundcloudPlayer: ReturnType<NonNullable<typeof window['SC']>['Widget']>;

  private initializationPromise: Promise<void>;

  private render: () => void;

  constructor(args: { render: MusicService['render'] }) {
    this.render = args.render;

    const soundcloudPlayerIframe =
      document.querySelector('#soundcloud-player') || throwError();

    this.soundcloudPlayer = (window.SC ?? throwError()).Widget(
      soundcloudPlayerIframe as HTMLIFrameElement,
    );

    this.initializationPromise = new Promise((resolve) => {
      const onReady = () => {
        this.soundcloudPlayer.pause();

        this.soundcloudPlayer.unbind(
          (window.SC || throwError()).Widget.Events.READY,
        );

        resolve();
      };

      this.soundcloudPlayer.bind(
        (window.SC || throwError()).Widget.Events.READY,
        onReady,
      );
    });

    // LOOP BACKGROUND MUSIC
    this.soundcloudPlayer.bind(
      (window.SC || throwError()).Widget.Events.FINISH,
      () => {
        this.soundcloudPlayer.seekTo(0);
        this.soundcloudPlayer.play();

        const gameElement = document.querySelector(
          '#game-root canvas',
        ) as HTMLCanvasElement;

        gameElement.focus();
      },
    );
  }

  playMusic(musicUrl: string | null) {
    if (musicUrl && musicUrl !== this.lastMusicUrl) {
      (async () => {
        await this.initializationPromise;

        this.soundcloudPlayer.load(musicUrl, {
          callback: () => {
            this.soundcloudPlayer.getCurrentSound((s) => {
              this.song = s;
              this.render();
            });
            this.soundcloudPlayer.play();
          },
        });

        this.lastMusicUrl = musicUrl;
      })();
    }
  }
}

export function MusicTicker(props: {
  onService: (musicService: MusicService) => void;
}) {
  const [, replaceRenderId] = useState<string>(v4());
  const [service, replaceService] = useState<MusicService | undefined>();

  useEffect(() => {
    const sv = new MusicService({
      render: () => replaceRenderId(v4()),
    });

    replaceService(sv);
    props.onService(sv);
  }, []);

  return (
    <>
      <>
        {service ? (
          <div
            style={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {service.song ? (
              <LinkAnchor
                style={{ textDecoration: 'underline' }}
                className="link-unstyled"
                href={service.song.permalink_url}
              >
                {service.song.title} - {service.song.user.username}
              </LinkAnchor>
            ) : null}
          </div>
        ) : null}
      </>
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
