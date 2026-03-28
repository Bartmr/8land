import { Direction } from './components/components/screens/land/grid.types';

type ScreensWithEscape = 'appScreen' | 'dialogueScreen' | 'landScreen';
type EscapeCallback = () => 'stop-propagation' | 'continue-propagation';

class Gamepad {
  private currentDirection: Direction = Direction.NONE;
  private pressedDirections: Direction[] = [];

  private A_isPressed = false;
  private B_isPressed = false;
  private Escape_isPressed = false;

  private A_pressed_callbacks: Set<() => void> = new Set();
  private B_pressed_callbacks: Set<() => void> = new Set();
  private Escape_pressed_callbacks: {
    [K in ScreensWithEscape]?: EscapeCallback;
  } = {};

  private currentIframe?: HTMLIFrameElement;

  sendToIframe(
    message:
      | `8land:gamepad:${Direction}`
      | `8land:gamepad:${'a' | 'b'}:${'pressed' | 'released'}`,
  ) {
    this.currentIframe?.contentWindow?.postMessage(message, '*');
  }

  // KEYBOARD METHODS
  directionWasPressed(direction: Direction) {
    this.pressedDirections.push(direction);
    this.currentDirection = direction;

    this.sendToIframe(`8land:gamepad:${this.currentDirection}`);
  }
  directionWasReleased(direction: Direction) {
    this.pressedDirections = this.pressedDirections.filter(
      (d) => d !== direction,
    );

    if (this.pressedDirections.length === 0) {
      this.currentDirection = Direction.NONE;
      this.sendToIframe(`8land:gamepad:none`);
    } else {
      this.currentDirection =
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.pressedDirections[this.pressedDirections.length - 1]!;

      this.sendToIframe(`8land:gamepad:${this.currentDirection}`);
    }
  }
  // NIPPLE METHODS
  setDirection(direction: Direction) {
    this.currentDirection = direction;

    this.sendToIframe(`8land:gamepad:${this.currentDirection}`);
  }
  getDirection() {
    return this.currentDirection;
  }

  //
  //
  //

  A_keyWasPressed() {
    this.A_isPressed = true;

    this.sendToIframe(`8land:gamepad:a:pressed`);

    this.A_pressed_callbacks.forEach((cb) => {
      cb();
    });
  }
  A_keyWasReleased() {
    this.A_isPressed = false;

    this.sendToIframe(`8land:gamepad:a:released`);
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

    this.sendToIframe(`8land:gamepad:b:pressed`);

    this.B_pressed_callbacks.forEach((cb) => {
      cb();
    });
  }
  B_keyWasReleased() {
    this.B_isPressed = false;

    this.sendToIframe(`8land:gamepad:b:released`);
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

  Escape_keyWasPressed() {
    this.Escape_isPressed = true;

    let stop = false;

    if (this.Escape_pressed_callbacks['appScreen']) {
      stop =
        this.Escape_pressed_callbacks['appScreen']() === 'stop-propagation'
          ? true
          : false;
    }

    if (this.Escape_pressed_callbacks['dialogueScreen'] && !stop) {
      stop =
        this.Escape_pressed_callbacks['dialogueScreen']() === 'stop-propagation'
          ? true
          : false;
    }

    if (this.Escape_pressed_callbacks['landScreen'] && !stop) {
      stop =
        this.Escape_pressed_callbacks['landScreen']() === 'stop-propagation'
          ? true
          : false;
    }
  }
  Escape_keyWasReleased() {
    this.Escape_isPressed = false;
  }
  isEscapePressed() {
    return this.Escape_isPressed;
  }
  onPressing_Escape(cb: EscapeCallback, screen: ScreensWithEscape) {
    this.Escape_pressed_callbacks[screen] = cb;
  }
  removePressing_Escape_Callback(screen: ScreensWithEscape) {
    this.Escape_pressed_callbacks[screen] = undefined;
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

const joystick = new Gamepad();

export type GamepadType = Gamepad;

export const GamepadSingleton = {
  getInstance: (): Gamepad => joystick,
};
