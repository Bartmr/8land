import { throwError } from '@app/shared/internals/utils/throw-error';
import { boolean } from 'not-me/lib/schemas/boolean/boolean-schema';
import { object } from 'not-me/lib/schemas/object/object-schema';
import { objectOf } from 'not-me/lib/schemas/object/object-of-schema';
import { HotReloadClass } from 'src/logic/app-internals/utils/hot-reload-class';
import { TILE_SIZE } from './game-constants';
import { Direction } from './grid.types';
import { Block, BlockType, DoorBlock } from './land-scene.types';
import { Player } from './player';

const Vector2 = Phaser.Math.Vector2;

/**
 * TODO
 * if user hasnt walked over a tile that isnt the door it left
 * do not go back into the previous land again
 *
 * have a boolean like walkedOverSafeTile
 *
 * if it didnt, dont go enter the indoor again
 *
 */

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

  private hasSteppedOnSafeTile = false;

  constructor(
    private player: Player,
    private context: {
      land: {
        id: string;
        tilemap: Phaser.Tilemaps.Tilemap;
        blocks: Block[];
      };
      territories: Array<{
        id: string;
        blocks: Block[];
        startX: number;
        endX: number;
        startY: number;
        endY: number;
        tilemap: Phaser.Tilemaps.Tilemap;
      }>;
      onStepIntoDoor: (block: DoorBlock) => void;
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
    } else {
      if (this.shouldContinueMoving()) {
        this.movePlayerSprite(pixelsToWalkThisUpdate);
        this.updatePlayerTilePos();
      } else {
        this.movePlayerSprite(TILE_SIZE - this.tileSizePixelsWalked);
        this.stopMoving();
      }

      this.reactToLandBlockTouch();
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
    return this.isBlockingTile(this.nextTileInDirection(direction));
  }

  private nextTileInDirection(direction: Direction): Phaser.Math.Vector2 {
    return this.player
      .getTilePos()
      .add(this.movementDirectionVectors[direction] || throwError());
  }

  private isBlockingTile(pos: Phaser.Math.Vector2): boolean {
    if (this.hasNoTileInLand(pos)) return true;

    let landCollides = false;

    for (const territory of this.context.territories) {
      if (
        !(
          (pos.x >= territory.startX || pos.x <= territory.endX) &&
          (pos.y >= territory.startY || pos.y <= territory.endY)
        )
      ) {
        continue;
      }

      for (const layer of territory.tilemap.layers) {
        const tile = territory.tilemap.getTileAt(
          pos.x - territory.startX,
          pos.y - territory.startY,
          false,
          layer.name,
        ) as Phaser.Tilemaps.Tile | null;

        if (!tile) {
          continue;
        }

        const tileProps = object({
          collides: boolean(),
        })
          .required()
          .validate(tile.properties);

        if (tileProps.errors) {
          throw new Error(JSON.stringify(tileProps.messagesTree));
        }

        landCollides = !!tileProps.value.collides;

        if (landCollides) {
          break;
        }
      }

      if (landCollides) {
        break;
      }
    }

    if (landCollides) {
      return landCollides;
    }

    for (const layer of this.context.land.tilemap.layers) {
      const tile = this.context.land.tilemap.getTileAt(
        pos.x,
        pos.y,
        false,
        layer.name,
      ) as Phaser.Tilemaps.Tile | null;

      if (!tile) {
        throw new Error();
      }

      const tileProps = object({
        collides: boolean(),
      })
        .required()
        .validate(tile.properties);

      if (tileProps.errors) {
        throw new Error(JSON.stringify(tileProps.messagesTree));
      }

      landCollides = !!tileProps.value.collides;

      if (landCollides) {
        break;
      }
    }

    return landCollides;
  }

  private hasNoTileInLand(pos: Phaser.Math.Vector2): boolean {
    return !this.context.land.tilemap.layers.some((layer) => {
      return this.context.land.tilemap.hasTileAt(pos.x, pos.y, layer.name);
    });
  }

  /*
    LAND BLOCK METHODS
  */
  private reactToLandBlockTouch() {
    const pos = this.player.getTilePos();

    let blockToReactTo: Block | undefined;

    for (const territory of this.context.territories) {
      if (
        !(
          (pos.x >= territory.startX || pos.x <= territory.endX) &&
          (pos.y >= territory.startY || pos.y <= territory.endY)
        )
      ) {
        continue;
      }

      for (const layer of territory.tilemap.layers) {
        const tile = territory.tilemap.getTileAt(
          pos.x - territory.startX,
          pos.y - territory.startY,
          false,
          layer.name,
        ) as Phaser.Tilemaps.Tile | null;

        if (!tile) {
          continue;
        }

        const tileProps = objectOf(boolean())
          .required()
          .validate(tile.properties);

        if (tileProps.errors) {
          throw new Error(JSON.stringify(tileProps.messagesTree));
        }

        const blockId = Object.keys(tileProps.value).filter(
          (key) => tileProps.value[key],
        )[0];

        if (blockId) {
          const block = territory.blocks.find((b) => blockId === b.id);

          if (block) {
            blockToReactTo = block;
            break;
          }
        }
      }

      if (blockToReactTo) {
        break;
      }
    }

    if (!blockToReactTo) {
      for (const layer of this.context.land.tilemap.layers) {
        const tile = this.context.land.tilemap.getTileAt(
          pos.x,
          pos.y,
          false,
          layer.name,
        ) as Phaser.Tilemaps.Tile | null;

        if (!tile) {
          throw new Error();
        }

        const tileProps = objectOf(boolean())
          .required()
          .validate(tile.properties);

        if (tileProps.errors) {
          throw new Error(JSON.stringify(tileProps.messagesTree));
        }

        const blockId = Object.keys(tileProps.value).filter(
          (key) => tileProps.value[key],
        )[0];

        if (blockId) {
          const block = this.context.land.blocks.find((b) => blockId === b.id);

          if (block) {
            blockToReactTo = block;
            break;
          }
        }
      }
    }

    if (blockToReactTo) {
      if (!this.hasSteppedOnSafeTile) {
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (blockToReactTo.type === BlockType.Door) {
        this.context.onStepIntoDoor(blockToReactTo);
      }
    } else {
      this.hasSteppedOnSafeTile = true;
    }
  }
}

export { GridPhysics };
