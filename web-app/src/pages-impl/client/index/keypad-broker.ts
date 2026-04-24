import { useMemo } from 'react';
import { Direction } from './screens/land/grid.types';

type ScreensWithBack = 'appScreen' | 'dialogueScreen' | 'landScreen';
type BackCallback = () => 'stop-propagation' | 'continue-propagation';

export class KeypadBroker {
  private currentDirection: Direction = Direction.NONE;
  private pressedDirections: Direction[] = [];

  private A_isPressed = false;
  private B_isPressed = false;
  private Back_isPressed = false;

  private A_pressed_callbacks: Set<() => void> = new Set();
  private B_pressed_callbacks: Set<() => void> = new Set();
  private Back_pressed_callbacks: {
    [K in ScreensWithBack]?: BackCallback;
  } = {};

  private currentIframe?: HTMLIFrameElement;

  sendToIframe(
    message:
      | `8land:keypad:direction:${Direction}`
      | `8land:keypad:${'a' | 'b'}:${'pressed' | 'released'}`,
  ) {
    this.currentIframe?.contentWindow?.postMessage(message, '*');
  }

  // KEYBOARD METHODS
  directionWasPressed(direction: Direction) {
    this.pressedDirections.push(direction);
    this.currentDirection = direction;

    this.sendToIframe(`8land:keypad:direction:${this.currentDirection}`);
  }
  directionWasReleased(direction: Direction) {
    this.pressedDirections = this.pressedDirections.filter(
      (d) => d !== direction,
    );

    if (this.pressedDirections.length === 0) {
      this.currentDirection = Direction.NONE;
      this.sendToIframe(`8land:keypad:direction:none`);
    } else {
      this.currentDirection =
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.pressedDirections[this.pressedDirections.length - 1]!;

      this.sendToIframe(`8land:keypad:direction:${this.currentDirection}`);
    }
  }
  // NIPPLE METHODS
  setDirection(direction: Direction) {
    this.currentDirection = direction;

    this.sendToIframe(`8land:keypad:direction:${this.currentDirection}`);
  }
  getDirection() {
    return this.currentDirection;
  }

  //
  //
  //

  A_keyWasPressed() {
    this.A_isPressed = true;

    this.sendToIframe(`8land:keypad:a:pressed`);

    this.A_pressed_callbacks.forEach((cb) => {
      cb();
    });
  }
  A_keyWasReleased() {
    this.A_isPressed = false;

    this.sendToIframe(`8land:keypad:a:released`);
  }
  isAPressed() {
    return this.A_isPressed;
  }
  onPressing_A(cb: () => void) {
    this.A_pressed_callbacks.add(cb);
  }
  removePressing_A_Callback(cb: () => void) {
    this.A_pressed_callbacks.delete(cb);
  }

  //
  //
  //

  B_keyWasPressed() {
    this.B_isPressed = true;

    this.sendToIframe(`8land:keypad:b:pressed`);

    this.B_pressed_callbacks.forEach((cb) => {
      cb();
    });
  }
  B_keyWasReleased() {
    this.B_isPressed = false;

    this.sendToIframe(`8land:keypad:b:released`);
  }
  isBPressed() {
    return this.B_isPressed;
  }
  onPressing_B(cb: () => void) {
    this.B_pressed_callbacks.add(cb);
  }
  removePressing_B_Callback(cb: () => void) {
    this.B_pressed_callbacks.delete(cb);
  }

  //
  //
  //

  Back_keyWasPressed() {
    this.Back_isPressed = true;

    let stop = false;

    if (this.Back_pressed_callbacks['appScreen']) {
      stop =
        this.Back_pressed_callbacks['appScreen']() === 'stop-propagation'
          ? true
          : false;
    }

    if (this.Back_pressed_callbacks['dialogueScreen'] && !stop) {
      stop =
        this.Back_pressed_callbacks['dialogueScreen']() === 'stop-propagation'
          ? true
          : false;
    }

    if (this.Back_pressed_callbacks['landScreen'] && !stop) {
      stop =
        this.Back_pressed_callbacks['landScreen']() === 'stop-propagation'
          ? true
          : false;
    }
  }
  Back_keyWasReleased() {
    this.Back_isPressed = false;
  }
  isBackPressed() {
    return this.Back_isPressed;
  }
  onPressing_Back(cb: BackCallback, screen: ScreensWithBack) {
    this.Back_pressed_callbacks[screen] = cb;
  }
  removePressing_Back_Callback(screen: ScreensWithBack) {
    this.Back_pressed_callbacks[screen] = undefined;
  }

  //
  //
  //
  clearCurrentIframe() {
    this.currentIframe = undefined;
  }
  setCurrentIframe(iframe: HTMLIFrameElement) {
    this.currentIframe = iframe;
  }
}

export function useKeypadBroker() {
  const keypad = useMemo(() => new KeypadBroker(), [])
  return keypad
}