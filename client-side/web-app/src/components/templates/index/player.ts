import { HotReloadClass } from 'src/logic/app-internals/utils/hot-reload-class';
import { TILE_SIZE } from './game-constants';

@HotReloadClass(module)
export class Player {
  constructor(
    private sprite: Phaser.GameObjects.Sprite,
    private tilePos: Phaser.Math.Vector2,
  ) {
    const offsetX = TILE_SIZE / 2;
    const offsetY = TILE_SIZE;

    this.sprite.setOrigin(0, 0);
    this.sprite.setPosition(
      tilePos.x * TILE_SIZE + offsetX,
      tilePos.y * TILE_SIZE + offsetY,
    );
    this.sprite.setFrame(55);
  }

  getPosition(): Phaser.Math.Vector2 {
    return this.sprite.getBottomCenter();
  }

  setPosition(position: Phaser.Math.Vector2): void {
    this.sprite.setPosition(position.x, position.y);
  }
}
