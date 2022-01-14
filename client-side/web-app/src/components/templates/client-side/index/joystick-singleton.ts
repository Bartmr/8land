import { Direction } from './grid.types';

class Joystick {
  private currentDirection: Direction = Direction.NONE;

  setDirection(direction: Direction) {
    this.currentDirection = direction;
  }

  getDirection() {
    return this.currentDirection;
  }
}

const joystick = new Joystick();

export const JoystickSingleton = {
  getInstance: (): undefined | Joystick => joystick,
};
