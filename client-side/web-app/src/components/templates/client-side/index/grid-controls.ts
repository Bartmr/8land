import { HotReloadClass } from 'src/logic/app-internals/utils/hot-reload-class';
import { GridPhysics } from './grid-physics';
import { Direction } from './grid.types';

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
    if (cursors.left.isDown) {
      this.gridPhysics.movePlayer(Direction.LEFT);
    } else if (cursors.right.isDown) {
      this.gridPhysics.movePlayer(Direction.RIGHT);
    } else if (cursors.up.isDown) {
      this.gridPhysics.movePlayer(Direction.UP);
    } else if (cursors.down.isDown) {
      this.gridPhysics.movePlayer(Direction.DOWN);
    }
  }
}
