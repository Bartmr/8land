import { Direction } from './components/components/screens/land/grid.types';

class Gamepad {
  private currentDirection: Direction = Direction.NONE;
  private lastPressedDirection: Direction = Direction.NONE;

  private A_isPressed = false;
  private B_isPressed = false;

  private A_pressed_callbacks: Set<() => void> = new Set();
  private B_pressed_callbacks: Set<() => void> = new Set();

  // KEYBOARD METHODS
  directionWasPressed(direction: Direction) {
    this.lastPressedDirection = direction;
    this.currentDirection = direction;
  }
  directionWasReleased(direction: Direction) {
    if (this.lastPressedDirection === direction) {
      this.currentDirection = Direction.NONE;
    }
  }
  // NIPPLE METHODS
  setDirection(direction: Direction) {
    this.currentDirection = direction;
  }
  getDirection() {
    return this.currentDirection;
  }

  //
  //
  //

  A_keyWasPressed() {
    this.A_isPressed = true;

    this.A_pressed_callbacks.forEach((cb) => {
      cb();
    });
  }
  A_keyWasReleased() {
    this.A_isPressed = false;
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

    this.B_pressed_callbacks.forEach((cb) => {
      cb();
    });
  }
  B_keyWasReleased() {
    this.B_isPressed = false;
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
}

const joystick = new Gamepad();

export type GamepadType = Gamepad;

export const GamepadSingleton = {
  getInstance: (): Gamepad => joystick,
};
