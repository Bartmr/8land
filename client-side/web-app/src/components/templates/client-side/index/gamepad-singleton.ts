import { Direction } from './components/components/screens/land/grid.types';

class Gamepad {
  private currentDirection: Direction = Direction.NONE;
  private lastPressedDirection: Direction = Direction.NONE;

  private A_isPressed = false;
  private B_isPressed = false;
  private Escape_isPressed = false;

  private A_pressed_callbacks: Set<() => void> = new Set();
  private B_pressed_callbacks: Set<() => void> = new Set();
  private Escape_pressed_callbacks: Set<() => void> = new Set();

  private currentIframe?: HTMLIFrameElement;

  // KEYBOARD METHODS
  directionWasPressed(direction: Direction) {
    this.lastPressedDirection = direction;
    this.currentDirection = direction;

    this.currentIframe?.contentWindow?.postMessage(
      `8land:gamepad:${this.currentDirection}`,
      '*',
    );
  }
  directionWasReleased(direction: Direction) {
    if (this.lastPressedDirection === direction) {
      this.currentDirection = Direction.NONE;
    }

    this.currentIframe?.contentWindow?.postMessage(
      `8land:gamepad:${this.currentDirection}`,
      '*',
    );
  }
  // NIPPLE METHODS
  setDirection(direction: Direction) {
    this.currentDirection = direction;

    this.currentIframe?.contentWindow?.postMessage(
      `8land:gamepad:${this.currentDirection}`,
      '*',
    );
  }
  getDirection() {
    return this.currentDirection;
  }

  //
  //
  //

  A_keyWasPressed() {
    this.A_isPressed = true;

    this.currentIframe?.contentWindow?.postMessage(
      `8land:gamepad:a:pressed`,
      '*',
    );

    this.A_pressed_callbacks.forEach((cb) => {
      cb();
    });
  }
  A_keyWasReleased() {
    this.A_isPressed = false;

    this.currentIframe?.contentWindow?.postMessage(
      `8land:gamepad:a:released`,
      '*',
    );
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

    this.currentIframe?.contentWindow?.postMessage(
      `8land:gamepad:b:pressed`,
      '*',
    );

    this.B_pressed_callbacks.forEach((cb) => {
      cb();
    });
  }
  B_keyWasReleased() {
    this.B_isPressed = false;

    this.currentIframe?.contentWindow?.postMessage(
      `8land:gamepad:b:released`,
      '*',
    );
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

    this.Escape_pressed_callbacks.forEach((cb) => {
      cb();
    });
  }
  Escape_keyWasReleased() {
    this.Escape_isPressed = false;
  }
  isEscapePressed() {
    return this.Escape_isPressed;
  }
  onPressing_Escape(cb: () => void) {
    this.Escape_pressed_callbacks.add(cb);
  }
  removePressing_Escape_Callback(cb: () => void) {
    this.Escape_pressed_callbacks.delete(cb);
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
