import { throwError } from '@app/shared/internals/utils/throw-error';
import { boolean } from 'not-me/lib/schemas/boolean/boolean-schema';
import { object } from 'not-me/lib/schemas/object/object-schema';
import { HotReloadClass } from 'src/logic/app-internals/utils/hot-reload-class';
import { TILE_SIZE } from './game-constants';
import { Direction } from './grid.types';
import { Player } from './player';

const Vector2 = Phaser.Math.Vector2;

@HotReloadClass(module)
class GridPhysics {
  private movementDirectionVectors: {
    [key in Direction]?: Phaser.Math.Vector2;
  } = {
    [Direction.UP]: Vector2.UP,
    [Direction.DOWN]: Vector2.DOWN,
    [Direction.LEFT]: Vector2.LEFT,
    [Direction.RIGHT]: Vector2.RIGHT,
  };

  private movementDirection: Direction = Direction.NONE;

  private readonly speedPixelsPerSecond: number = TILE_SIZE * 4;
  private tileSizePixelsWalked: number = 0;

  private lastMovementIntent = Direction.NONE;

  constructor(
    private player: Player,
    private context: {
      land: {
        tilemap: Phaser.Tilemaps.Tilemap;
      };
      territories: Array<{
        startX: number;
        startY: number;
        tilemap: Phaser.Tilemaps.Tilemap;
      }>;
    },
  ) {}

  movePlayer(direction: Direction): void {
    this.lastMovementIntent = direction;
    if (this.isMoving()) return;
    if (this.isBlockingDirection(direction)) {
      this.player.stopAnimation(direction);
    } else {
      this.startMoving(direction);
    }
  }

  update(delta: number) {
    if (this.isMoving()) {
      this.updatePlayerPosition(delta);
    }
    this.lastMovementIntent = Direction.NONE;
  }

  private isMoving(): boolean {
    return this.movementDirection !== Direction.NONE;
  }

  private startMoving(direction: Direction): void {
    this.player.startAnimation(direction);
    this.movementDirection = direction;
    this.updatePlayerTilePos();
  }

  private updatePlayerPosition(delta: number) {
    const pixelsToWalkThisUpdate = this.getPixelsToWalkThisUpdate(delta);

    if (!this.willCrossTileBorderThisUpdate(pixelsToWalkThisUpdate)) {
      this.movePlayerSprite(pixelsToWalkThisUpdate);
    } else if (this.shouldContinueMoving()) {
      this.movePlayerSprite(pixelsToWalkThisUpdate);
      this.updatePlayerTilePos();
    } else {
      this.movePlayerSprite(TILE_SIZE - this.tileSizePixelsWalked);
      this.stopMoving();
    }
  }

  private updatePlayerTilePos() {
    this.player.setTilePos(
      this.player
        .getTilePos()
        .add(
          this.movementDirectionVectors[this.movementDirection] || throwError(),
        ),
    );
  }

  private movePlayerSprite(pixelsToMove: number) {
    const directionVec = (
      this.movementDirectionVectors[this.movementDirection] || throwError()
    ).clone();
    const movementDistance = directionVec.multiply(new Vector2(pixelsToMove));
    const newPlayerPos = this.player.getPosition().add(movementDistance);
    this.player.setPosition(newPlayerPos);

    this.tileSizePixelsWalked += pixelsToMove;
    this.tileSizePixelsWalked %= TILE_SIZE;
  }

  private getPixelsToWalkThisUpdate(delta: number): number {
    const deltaInSeconds = delta / 1000;
    return this.speedPixelsPerSecond * deltaInSeconds;
  }

  private stopMoving(): void {
    this.player.stopAnimation(this.movementDirection);
    this.movementDirection = Direction.NONE;
  }

  private willCrossTileBorderThisUpdate(
    pixelsToWalkThisUpdate: number,
  ): boolean {
    return this.tileSizePixelsWalked + pixelsToWalkThisUpdate >= TILE_SIZE;
  }

  private shouldContinueMoving(): boolean {
    return (
      this.movementDirection === this.lastMovementIntent &&
      !this.isBlockingDirection(this.lastMovementIntent)
    );
  }

  private isBlockingDirection(direction: Direction): boolean {
    return this.hasBlockingTile(this.tilePosInDirection(direction));
  }

  private tilePosInDirection(direction: Direction): Phaser.Math.Vector2 {
    return this.player
      .getTilePos()
      .add(this.movementDirectionVectors[direction] || throwError());
  }

  private hasBlockingTile(pos: Phaser.Math.Vector2): boolean {
    if (this.hasNoTileInLand(pos)) return true;

    const landCollides = this.context.land.tilemap.layers.some((layer) => {
      const tile = this.context.land.tilemap.getTileAt(
        pos.x,
        pos.y,
        false,
        layer.name,
      );

      const tileProps = object({
        collides: boolean(),
      })
        .required()
        .validate(tile.properties);

      if (tileProps.errors) {
        throw new Error(JSON.stringify(tileProps.messagesTree));
      }

      return tileProps.value.collides;
    });

    if (landCollides) {
      return true;
    }

    return this.context.territories.some((territory) => {
      return territory.tilemap.layers.some((layer) => {
        const tile = territory.tilemap.getTileAt(
          pos.x - territory.startX,
          pos.y - territory.startY,
          false,
          layer.name,
        ) as Phaser.Tilemaps.Tile | null;

        if (!tile) {
          return false;
        }

        const tileProps = object({
          collides: boolean(),
        })
          .required()
          .validate(tile.properties);

        if (tileProps.errors) {
          throw new Error(JSON.stringify(tileProps.messagesTree));
        }

        return tileProps.value.collides;
      });
    });
  }

  private hasNoTileInLand(pos: Phaser.Math.Vector2): boolean {
    return !this.context.land.tilemap.layers.some((layer) => {
      return this.context.land.tilemap.hasTileAt(pos.x, pos.y, layer.name);
    });
  }
}

export { GridPhysics };
