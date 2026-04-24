import React from 'react';
import nipplejs from 'nipplejs';
import { useEffect } from 'react';
import { Direction } from './screens/land/grid.types';
import { throwError } from '../../../throw-error';
import { KeypadBroker } from './keypad-broker'

const ESCAPE_BUTTON_SELECTOR = '#game-button-back';

export function BackKeyActive() {
  return <style>
          {`
@keyframes back-button-pulse {
  10% {
    background-color: #ffff55;
    transform: scale3d(1.05, 1.05, 1.05);
  }
  100% {
    background-color: var(--bs-light);
    transform: scale3d(1, 1, 1);
  }
}

${ESCAPE_BUTTON_SELECTOR} {
  animation: back-button-pulse 1.5s infinite;
}
    `}
  </style>
}

export function Keypad(props: { keypad: KeypadBroker }) {
  useEffect(() => {
    const nippleZone = document.querySelector('#game-nipple') || throwError();

    if (!(nippleZone instanceof HTMLElement)) {
      throwError();
    }
    const nipple = nipplejs.create({
      zone: nippleZone,
    });

    const keypad = props.keypad;

    nipple.on('dir:up', () => {
      keypad.setDirection(Direction.UP);
    });

    nipple.on('dir:down', () => {
      keypad.setDirection(Direction.DOWN);
    });

    nipple.on('dir:left', () => {
      keypad.setDirection(Direction.LEFT);
    });

    nipple.on('dir:right', () => {
      keypad.setDirection(Direction.RIGHT);
    });

    nipple.on('end', () => {
      keypad.setDirection(Direction.NONE);
    });

    const gameButtonA =
      document.querySelector('#game-button-a') || throwError();
    const gameButtonAPressedListener = () => {
      keypad.A_keyWasPressed();
    };
    gameButtonA.addEventListener('pointerdown', gameButtonAPressedListener);
    const gameButtonAReleasedListener = () => {
      keypad.A_keyWasReleased();
    };
    gameButtonA.addEventListener('pointerup', gameButtonAReleasedListener);

    const gameButtonB =
      document.querySelector('#game-button-b') || throwError();
    const gameButtonBPressedListener = () => {
      keypad.B_keyWasPressed();
    };
    gameButtonB.addEventListener('pointerdown', gameButtonBPressedListener);
    const gameButtonBReleasedListener = () => {
      keypad.B_keyWasReleased();
    };
    gameButtonB.addEventListener('pointerup', gameButtonBReleasedListener);

    const gameButtonBack =
      document.querySelector('#game-button-back') || throwError();
    const gameButtonBackPressedListener = () => {
      keypad.Back_keyWasPressed();
    };
    gameButtonBack.addEventListener(
      'pointerdown',
      gameButtonBackPressedListener,
    );
    const gameButtonBackReleasedListener = () => {
      keypad.Back_keyWasReleased();
    };
    gameButtonBack.addEventListener(
      'pointerup',
      gameButtonBackReleasedListener,
    );

    const keyDownListener = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
        keypad.directionWasPressed(Direction.UP);
      } else if (e.key === 'ArrowDown') {
        keypad.directionWasPressed(Direction.DOWN);
      } else if (e.key === 'ArrowLeft') {
        keypad.directionWasPressed(Direction.LEFT);
      } else if (e.key === 'ArrowRight') {
        keypad.directionWasPressed(Direction.RIGHT);
      } else if (e.key === 'a') {
        keypad.A_keyWasPressed();
      } else if (e.key === 's') {
        keypad.B_keyWasPressed();
      }
    };

    const keyUpListener = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
        keypad.directionWasReleased(Direction.UP);
      } else if (e.key === 'ArrowDown') {
        keypad.directionWasReleased(Direction.DOWN);
      } else if (e.key === 'ArrowLeft') {
        keypad.directionWasReleased(Direction.LEFT);
      } else if (e.key === 'ArrowRight') {
        keypad.directionWasReleased(Direction.RIGHT);
      } else if (e.key === 'a') {
        keypad.A_keyWasReleased();
      } else if (e.key === 's') {
        keypad.B_keyWasReleased();
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

      gameButtonBack.removeEventListener(
        'pointerdown',
        gameButtonBackPressedListener,
      );
      gameButtonBack.removeEventListener(
        'pointerup',
        gameButtonBackReleasedListener,
      );
    };
  }, []);

  return (
    <>
      <div className="mt-3">
        {/* Secondary buttons*/}
        <div className="d-flex align-items-center">
          <div
            id="game-button-back"
            className="btn btn-sm btn-secondary"
            style={{ cursor: 'pointer' }}
          >
            Back
          </div>
        </div>
        <div className="me-4 mt-4 d-flex d-xl-none align-items-center justify-content-between">
          
          {/* DIRECTION PAD */}
          <div className="d-flex flex-row-reverse">
            <div
              style={{ position: 'absolute', width: '100px', height: '100px' }}
              id="game-nipple"
            ></div>
            <div
              style={{ width: '100px', height: '100px' }}
              className="bg-secondary text-contrasting d-flex align-items-center justify-content-center text-center small"
            >
              DRAG HERE
              <br />
              TO MOVE
            </div>
          </div>
          {/* A / B Keys */}
          <div className="d-flex">
            <button
              id="game-button-a"
              className="btn btn-secondary d-flex align-items-center justify-content-center"
              style={{ width: '50px', height: '50px' }}
            >
              A
            </button>
            <button
              id="game-button-b"
              className="ms-3 btn btn-secondary d-flex align-items-center justify-content-center"
              style={{ width: '50px', height: '50px' }}
            >
              B
            </button>
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
