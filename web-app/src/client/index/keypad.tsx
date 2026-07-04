import React from 'react';
import nipplejs from 'nipplejs';
import { useEffect, useRef } from 'react';
import { Direction } from "./screens/land/player-grid";
import { throwError } from '../../throw-error';
import { KeypadBroker } from './keypad-broker'

const ESCAPE_BUTTON_SELECTOR = '#game-button-escape';

export function EscapeKeyActive() {
  return <style>
          {`
@keyframes escape-button-pulse {
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
  animation: escape-button-pulse 1.5s infinite;
}
    `}
  </style>
}

export function Keypad(props: { keypad: KeypadBroker }) {
  const nippleZoneRef = useRef<HTMLDivElement | null>(null);
  const keypad = props.keypad;

  useEffect(() => {
    if (!nippleZoneRef.current) {
      throwError();
    }

    const nipple = nipplejs.create({
      zone: nippleZoneRef.current,
    });

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

    return () => {
      nipple.destroy();
    };
    
  }, [keypad]);

  useEffect(() => {
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
      window.removeEventListener('keyup', keyUpListener);
      window.removeEventListener('keydown', keyDownListener);
    };
  }, [keypad])

  const handleAKeyDown = () => {
    keypad.A_keyWasPressed();
  };

  const handleAKeyUp = () => {
    keypad.A_keyWasReleased();
  };

  const handleBKeyDown = () => {
    keypad.B_keyWasPressed();
  };

  const handleBKeyUp = () => {
    keypad.B_keyWasReleased();
  };

  const handleEscapeDown = () => {
    keypad.Escape_keyWasPressed();
  };

  const handleEscapeUp = () => {
    keypad.Escape_keyWasReleased();
  };

  return (
    <>
      <div className="mt-3">
        {/* Secondary buttons*/}
        <div className="d-flex align-items-center">
          <div
            id="game-button-escape"
            className="btn btn-sm btn-secondary"
            style={{ cursor: 'pointer' }}
            onPointerDown={handleEscapeDown}
            onPointerUp={handleEscapeUp}
          >
            Escape
          </div>
        </div>
        <div className="mt-4 d-flex d-xl-none align-items-center justify-content-between">
          
          {/* DIRECTION PAD */}
          <div className="d-flex flex-row-reverse">
            <div
              style={{ position: 'absolute', width: '100px', height: '100px' }}
              id="game-nipple"
              ref={nippleZoneRef}
            ></div>
            <div
              style={{ width: '150px', height: '150px', userSelect: "none" }}
              className="bg-secondary d-flex align-items-center justify-content-center text-center small"

            >
              DRAG HERE
              <br />
              TO MOVE
            </div>
          </div>
          {/* A / B Keys */}
          <div className="d-flex align-items-center gap-3">
            <button
              id="game-button-b"
              type="button"
              className="ms-3 btn btn-secondary d-flex align-items-center justify-content-center"
              style={{ width: '60px', height: '60px' }}
              onPointerDown={handleBKeyDown}
              onPointerUp={handleBKeyUp}
            >
              B
            </button>
            <button
              id="game-button-a"
              type="button"
              className="btn btn-secondary d-flex align-items-center justify-content-center"
              style={{ width: '70px', height: '70px' }}
              onPointerDown={handleAKeyDown}
              onPointerUp={handleAKeyUp}
            >
              A
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
