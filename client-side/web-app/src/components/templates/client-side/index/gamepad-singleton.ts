import { Direction } from './components/components/screens/land/grid.types';

class Gamepad {
  private currentDirection: Direction = Direction.NONE;
  private lastPressedDirection: Direction = Direction.NONE;

  private A_isPressed = false;
  private B_isPressed = false;

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
  }
  A_keyWasReleased() {
    this.A_isPressed = false;
  }
  isAPressed() {
    return this.A_isPressed;
  }

  //
  //
  //

  B_keyWasPressed() {
    this.B_isPressed = true;
  }
  B_keyWasReleased() {
    this.B_isPressed = false;
  }
  isBPressed() {
    return this.B_isPressed;
  }
}

const joystick = new Gamepad();

export type GamepadType = Gamepad;

export const GamepadSingleton = {
  getInstance: (): undefined | Gamepad => joystick,
};
