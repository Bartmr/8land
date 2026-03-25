import nipplejs from 'nipplejs';
import { throwError } from '@app/shared/internals/utils/throw-error';
import { GamepadSingleton } from '../../gamepad-singleton';
import { useEffect } from 'react';
import { Direction } from './screens/land/grid.types';

export function Keypad() {
  useEffect(() => {
    const nippleZone = document.querySelector('#game-nipple') || throwError();

    if (!(nippleZone instanceof HTMLElement)) {
      throwError();
    }
    const nipple = nipplejs.create({
      zone: nippleZone,
    });

    const gamepad = GamepadSingleton.getInstance();

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

    const gameButtonA =
      document.querySelector('#game-button-a') || throwError();
    const gameButtonAPressedListener = () => {
      gamepad.A_keyWasPressed();
    };
    gameButtonA.addEventListener('pointerdown', gameButtonAPressedListener);
    const gameButtonAReleasedListener = () => {
      gamepad.A_keyWasReleased();
    };
    gameButtonA.addEventListener('pointerup', gameButtonAReleasedListener);

    const gameButtonB =
      document.querySelector('#game-button-b') || throwError();
    const gameButtonBPressedListener = () => {
      gamepad.B_keyWasPressed();
    };
    gameButtonB.addEventListener('pointerdown', gameButtonBPressedListener);
    const gameButtonBReleasedListener = () => {
      gamepad.B_keyWasReleased();
    };
    gameButtonB.addEventListener('pointerup', gameButtonBReleasedListener);

    const gameButtonEscape =
      document.querySelector('#game-button-escape') || throwError();
    const gameButtonEscapePressedListener = () => {
      gamepad.Escape_keyWasPressed();
    };
    gameButtonEscape.addEventListener(
      'pointerdown',
      gameButtonEscapePressedListener,
    );
    const gameButtonEscapeReleasedListener = () => {
      gamepad.Escape_keyWasReleased();
    };
    gameButtonEscape.addEventListener(
      'pointerup',
      gameButtonEscapeReleasedListener,
    );

    const keyDownListener = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
        gamepad.directionWasPressed(Direction.UP);
      } else if (e.key === 'ArrowDown') {
        gamepad.directionWasPressed(Direction.DOWN);
      } else if (e.key === 'ArrowLeft') {
        gamepad.directionWasPressed(Direction.LEFT);
      } else if (e.key === 'ArrowRight') {
        gamepad.directionWasPressed(Direction.RIGHT);
      } else if (e.key === 'a') {
        gamepad.A_keyWasPressed();
      } else if (e.key === 's') {
        gamepad.B_keyWasPressed();
      }
    };

    const keyUpListener = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
        gamepad.directionWasReleased(Direction.UP);
      } else if (e.key === 'ArrowDown') {
        gamepad.directionWasReleased(Direction.DOWN);
      } else if (e.key === 'ArrowLeft') {
        gamepad.directionWasReleased(Direction.LEFT);
      } else if (e.key === 'ArrowRight') {
        gamepad.directionWasReleased(Direction.RIGHT);
      } else if (e.key === 'a') {
        gamepad.A_keyWasReleased();
      } else if (e.key === 's') {
        gamepad.B_keyWasReleased();
      }
    };

    window.addEventListener('keydown', keyDownListener);

    window.addEventListener('keyup', keyUpListener);

    return () => {
      nipple.destroy();

      window.removeEventListener('keyup', keyUpListener);
      window.removeEventListener('keydown', keyDownListener);

      gameButtonA.removeEventListener(
        'pointerdown',
        gameButtonAPressedListener,
      );
      gameButtonA.removeEventListener('pointerup', gameButtonAReleasedListener);

      gameButtonB.removeEventListener(
        'pointerdown',
        gameButtonBPressedListener,
      );
      gameButtonB.removeEventListener('pointerup', gameButtonBReleasedListener);

      gameButtonEscape.removeEventListener(
        'pointerdown',
        gameButtonEscapePressedListener,
      );
      gameButtonEscape.removeEventListener(
        'pointerup',
        gameButtonEscapeReleasedListener,
      );
    };
  }, []);

  return (
    <>
      <div className="mt-3">
        {/* Secondary buttons*/}
        <div className="d-flex align-items-center">
          <div
            id="game-button-escape"
            className="btn-sm btn-light"
            style={{ cursor: 'pointer' }}
          >
            Escape
          </div>
        </div>
        <div className="me-4 mt-4 d-flex d-xl-none align-items-center justify-content-between">
          {/* A / B Keys */}
          <div className="d-flex">
            <button
              id="game-button-a"
              className="btn btn-light d-flex align-items-center justify-content-center"
              style={{ width: '50px', height: '50px' }}
            >
              A
            </button>
            <button
              id="game-button-b"
              className="ms-3 btn btn-light d-flex align-items-center justify-content-center"
              style={{ width: '50px', height: '50px' }}
            >
              B
            </button>
          </div>
          {/* DIRECTION PAD */}
          <div className="d-flex flex-row-reverse">
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
        </div>
      </div>

      <div className="d-none d-xl-block mt-3">
        Use the arrow keys to move.
        <br />
        &quot;A&quot; for actions (like reading signs).
        <br />
        &quot;S&quot; for going back
      </div>
    </>
  );
}
