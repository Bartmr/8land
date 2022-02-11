import { throwError } from '@app/shared/internals/utils/throw-error';
import { GetLandDTO } from '@app/shared/land/get/get-land.dto';
import { useEffect, useState } from 'react';
import { MainApiSessionData } from 'src/logic/app-internals/apis/main/session/main-api-session-types';
import { useMainJSONApi } from 'src/logic/app-internals/apis/main/use-main-json-api';
import { SoundcloudSong } from '../../soundcloud-types';
import nipplejs from 'nipplejs';
import { runLandGame } from '../../land-game';
import { Direction } from '../../grid.types';
import { globalHistory } from '@reach/router';
import { GamepadSingleton } from '../../gamepad-singleton';

export function GameScreen(props: {
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

      const gamepad = GamepadSingleton.getInstance() || throwError();

      nipple.on('dir:up', () => {
        gamepad.setDirection(Direction.UP);
      });

      nipple.on('dir:down', () => {
        gamepad.setDirection(Direction.DOWN);
      });

      nipple.on('dir:left', () => {
        gamepad.setDirection(Direction.LEFT);
      });

      nipple.on('dir:right', () => {
        gamepad.setDirection(Direction.RIGHT);
      });

      nipple.on('end', () => {
        gamepad.setDirection(Direction.NONE);
      });

      const keyUpListener = (e: KeyboardEvent) => {
        if (e.key === 'ArrowUp') {
          gamepad.directionWasPressed(Direction.UP);
        } else if (e.key === 'ArrowDown') {
          gamepad.directionWasPressed(Direction.DOWN);
        } else if (e.key === 'ArrowLeft') {
          gamepad.directionWasPressed(Direction.LEFT);
        } else if (e.key === 'ArrowRight') {
          gamepad.directionWasPressed(Direction.RIGHT);
        }
      };

      const keyDownListener = (e: KeyboardEvent) => {
        if (e.key === 'ArrowUp') {
          gamepad.directionWasReleased(Direction.UP);
        } else if (e.key === 'ArrowDown') {
          gamepad.directionWasReleased(Direction.DOWN);
        } else if (e.key === 'ArrowLeft') {
          gamepad.directionWasReleased(Direction.LEFT);
        } else if (e.key === 'ArrowRight') {
          gamepad.directionWasReleased(Direction.RIGHT);
        }
      };

      window.addEventListener('keydown', keyUpListener);

      window.addEventListener('keyup', keyDownListener);

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
      const game = await runLandGame(
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

      const listener = globalHistory.listen(() => {
        // TODO fix bug where everything freezes when pressing back button
        game.destroy(true);
        nipple.destroy();

        window.removeEventListener('keyup', keyUpListener);
        window.removeEventListener('keydown', keyDownListener);

        listener();
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
