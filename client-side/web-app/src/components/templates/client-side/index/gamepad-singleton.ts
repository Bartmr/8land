import { Direction } from './grid.types';

class Gamepad {
  private currentDirection: Direction = Direction.NONE;

  pressedDirections: {
    [K in Direction]?: boolean;
  } = {};

  directionWasPressed(direction: Direction) {
    this.pressedDirections[direction] = true;
    this.currentDirection = direction;
  }

  directionWasReleased(direction: Direction) {
    this.pressedDirections[direction] = false;

    if (Object.values(this.pressedDirections).filter((c) => c).length === 0) {
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
