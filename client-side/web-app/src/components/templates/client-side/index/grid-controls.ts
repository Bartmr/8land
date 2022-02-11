import { throwError } from '@app/shared/internals/utils/throw-error';
import { HotReloadClass } from 'src/logic/app-internals/utils/hot-reload-class';
import { GridPhysics } from './grid-physics';
import { Direction } from './grid.types';
import { GamepadSingleton } from './gamepad-singleton';

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

    const gamePad = GamepadSingleton.getInstance() || throwError();

    const pressingLeft = gamePad.getDirection() === Direction.LEFT;
    const pressingRight = gamePad.getDirection() === Direction.RIGHT;
    const pressingUp = gamePad.getDirection() === Direction.UP;
    const pressingDown = gamePad.getDirection() === Direction.DOWN;

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
