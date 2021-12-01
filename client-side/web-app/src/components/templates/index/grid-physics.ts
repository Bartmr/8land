import { HotReloadClass } from 'src/logic/app-internals/utils/hot-reload-class';
import { TILE_SIZE } from './game-constants';
import { Direction } from './grid.types';
import { Player } from './player';

const Vector2 = Phaser.Math.Vector2;

@HotReloadClass(module)
export class GridPhysics {
  private readonly speedPixelsPerSecond: number = TILE_SIZE * 4;

  private movementDirection: Direction = Direction.NONE;

  private movementDirectionVectors: {
    [key in Direction]?: Phaser.Math.Vector2;
  } = {
    [Direction.UP]: Vector2.UP,
    [Direction.DOWN]: Vector2.DOWN,
    [Direction.LEFT]: Vector2.LEFT,
    [Direction.RIGHT]: Vector2.RIGHT,
  };

  constructor(private player: Player) {}

  update(delta: number) {
    if (this.isMoving()) {
      this.updatePlayerPosition(delta);
    }
  }
  // ...

  movePlayer(direction: Direction): void {
    if (!this.isMoving()) {
      this.startMoving(direction);
    }
  }

  private isMoving(): boolean {
    return this.movementDirection !== Direction.NONE;
  }

  private startMoving(direction: Direction): void {
    this.movementDirection = direction;
  }

  private updatePlayerPosition(delta: number) {
    const pixelsToWalkThisUpdate = this.getPixelsToWalkThisUpdate(delta);

    const vector = this.movementDirectionVectors[this.movementDirection];

    if (vector) {
      const directionVec = vector.clone();
      const movementDistance = directionVec.multiply(
        new Vector2(pixelsToWalkThisUpdate),
      );
      const newPlayerPos = this.player.getPosition().add(movementDistance);
      this.player.setPosition(newPlayerPos);
    }

    this.stopMoving();
  }

  private getPixelsToWalkThisUpdate(delta: number): number {
    const deltaInSeconds = delta / 1000;
    return this.speedPixelsPerSecond * deltaInSeconds;
  }

  private stopMoving(): void {
    this.movementDirection = Direction.NONE;
  }
}
