import { throwError } from '@app/shared/internals/utils/throw-error';
import { HotReloadClass } from 'src/logic/app-internals/utils/hot-reload-class';
import { GridPhysics } from './grid-physics';
import { Direction } from './grid.types';
import { JoystickSingleton } from './joystick-singleton';

@HotReloadClass(module)
export class GridControls {
  private locked = false;

  constructor(
    private input: Phaser.Input.InputPlugin,
    private gridPhysics: GridPhysics,
  ) {}

  lockControls() {
    this.locked = true;
  }

  unlockControls() {
    this.locked = false;
  }

  update() {
    if (this.locked) {
      return;
    }

    const cursors = this.input.keyboard.createCursorKeys();
    const joystick = JoystickSingleton.getInstance() || throwError();

    const pressingLeft =
      cursors.left.isDown || joystick.getDirection() === Direction.LEFT;
    const pressingRight =
      cursors.right.isDown || joystick.getDirection() === Direction.RIGHT;
    const pressingUp =
      cursors.up.isDown || joystick.getDirection() === Direction.UP;
    const pressingDown =
      cursors.down.isDown || joystick.getDirection() === Direction.DOWN;

    if (pressingLeft) {
      this.gridPhysics.movePlayer(Direction.LEFT);
    } else if (pressingRight) {
      this.gridPhysics.movePlayer(Direction.RIGHT);
    } else if (pressingUp) {
      this.gridPhysics.movePlayer(Direction.UP);
    } else if (pressingDown) {
      this.gridPhysics.movePlayer(Direction.DOWN);
    }
  }
}
