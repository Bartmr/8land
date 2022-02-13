import { Direction } from './grid.types';

class Gamepad {
  private currentDirection: Direction = Direction.NONE;

  lastPressedDirection: Direction = Direction.NONE;

  directionWasPressed(direction: Direction) {
    this.lastPressedDirection = direction;
    this.currentDirection = direction;
  }

  directionWasReleased(direction: Direction) {
    if (this.lastPressedDirection === direction) {
      this.currentDirection = Direction.NONE;
    }
  }

  setDirection(direction: Direction) {
    this.currentDirection = direction;
  }

  getDirection() {
    return this.currentDirection;
  }
}

const joystick = new Gamepad();

export const GamepadSingleton = {
  getInstance: (): undefined | Gamepad => joystick,
};
