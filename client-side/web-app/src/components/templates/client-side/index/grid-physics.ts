import { throwError } from '@app/shared/internals/utils/throw-error';
import { boolean } from 'not-me/lib/schemas/boolean/boolean-schema';
import { object } from 'not-me/lib/schemas/object/object-schema';
import { objectOf } from 'not-me/lib/schemas/object/object-of-schema';
import { HotReloadClass } from 'src/logic/app-internals/utils/hot-reload-class';
import { TILE_SIZE } from './game-constants';
import { Direction } from './grid.types';
import { Block, BlockType, DoorBlock } from './land-scene.types';
import { Player } from './player';
import { GamepadSingleton } from './gamepad-singleton';

const Vector2 = Phaser.Math.Vector2;

const DIRECTION_TO_VECTOR: {
  [key in Direction]?: Phaser.Math.Vector2;
} = {
  [Direction.UP]: Vector2.UP,
  [Direction.DOWN]: Vector2.DOWN,
  [Direction.LEFT]: Vector2.LEFT,
  [Direction.RIGHT]: Vector2.RIGHT,
};

@HotReloadClass(module)
class GridPhysics {
  private isLocked = false;

  private movingDirection: Direction = Direction.NONE;
  private directionBeingPressed = Direction.NONE;

  private tileSizePixelsWalked: number = 0;

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

  lock() {
    this.isLocked = true;
  }

  unlock() {
    this.isLocked = false;
  }

  update(delta: number) {
    if (this.isLocked) {
      return;
    }

    //
    // CONTINUE PREVIOUS ACTIONS
    //
    if (this.isMoving()) {
      this.updatePlayer(delta);
    }

    //
    // TRIGGER NEW ACTIONS BASED ON BUTTONS PRESSED
    //
    const gamePad = GamepadSingleton.getInstance() || throwError();

    const pressingLeft = gamePad.getDirection() === Direction.LEFT;
    const pressingRight = gamePad.getDirection() === Direction.RIGHT;
    const pressingUp = gamePad.getDirection() === Direction.UP;
    const pressingDown = gamePad.getDirection() === Direction.DOWN;

    if (pressingLeft) {
      this.directionBeingPressed = Direction.LEFT;
      this.movePlayer(Direction.LEFT);
    } else if (pressingRight) {
      this.directionBeingPressed = Direction.RIGHT;
      this.movePlayer(Direction.RIGHT);
    } else if (pressingUp) {
      this.directionBeingPressed = Direction.UP;
      this.movePlayer(Direction.UP);
    } else if (pressingDown) {
      this.directionBeingPressed = Direction.DOWN;
      this.movePlayer(Direction.DOWN);
    } else {
      // user wants to stop by not pressing any key
      this.directionBeingPressed = Direction.NONE;
    }
  }

  private movePlayer(direction: Direction): void {
    if (this.isMoving()) return;

    if (this.willCollideInNextBlock(direction)) {
      this.player.stopAnimation(direction);
    } else {
      this.player.startAnimation(direction);
      this.movingDirection = direction;
      this.changePlayerGridPosition();
    }
  }

  private isMoving(): boolean {
    return this.movingDirection !== Direction.NONE;
  }

  private updatePlayer(delta: number) {
    const pixelsToWalkThisUpdate = this.getPixelsToWalkThisUpdate(delta);

    if (this.willWalkOverANewTile(pixelsToWalkThisUpdate)) {
      if (this.shouldContinueMovingInSameDirection()) {
        this.setPlayerAbsolutePosition(pixelsToWalkThisUpdate);
        this.changePlayerGridPosition();
      } else {
        this.setPlayerAbsolutePosition(TILE_SIZE - this.tileSizePixelsWalked);
        this.stopMoving();
      }

      this.reactToLandBlockTouch();
    } else {
      this.setPlayerAbsolutePosition(pixelsToWalkThisUpdate);
    }
  }

  private changePlayerGridPosition() {
    this.player.setGridPosition(
      this.player
        .getGridPosition()
        .add(DIRECTION_TO_VECTOR[this.movingDirection] || throwError()),
    );
  }

  private setPlayerAbsolutePosition(pixelsToMove: number) {
    const directionVec = (
      DIRECTION_TO_VECTOR[this.movingDirection] || throwError()
    ).clone();
    const movementDistance = directionVec.multiply(new Vector2(pixelsToMove));

    this.player.setAbsolutePosition(
      this.player.getAbsolutePosition().add(movementDistance),
    );

    this.tileSizePixelsWalked += pixelsToMove;
    this.tileSizePixelsWalked %= TILE_SIZE;
  }

  private getPixelsToWalkThisUpdate(delta: number): number {
    const deltaInSeconds = delta / 1000;

    const pixelsPerSecond = TILE_SIZE * 4;

    return pixelsPerSecond * deltaInSeconds;
  }

  private stopMoving(): void {
    this.player.stopAnimation(this.movingDirection);
    this.movingDirection = Direction.NONE;
  }

  private willWalkOverANewTile(pixelsToWalkThisUpdate: number): boolean {
    return this.tileSizePixelsWalked + pixelsToWalkThisUpdate >= TILE_SIZE;
  }

  private shouldContinueMovingInSameDirection(): boolean {
    return (
      this.movingDirection === this.directionBeingPressed &&
      !this.willCollideInNextBlock(this.directionBeingPressed)
    );
  }

  private willCollideInNextBlock(direction: Direction): boolean {
    return this.isCollisionTile(this.getNextTilePosition(direction));
  }

  private getNextTilePosition(direction: Direction): Phaser.Math.Vector2 {
    return this.player
      .getGridPosition()
      .add(DIRECTION_TO_VECTOR[direction] || throwError());
  }

  private isCollisionTile(pos: Phaser.Math.Vector2): boolean {
    if (this.isOutsideLandBoundaries(pos)) return true;

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

  private isOutsideLandBoundaries(pos: Phaser.Math.Vector2): boolean {
    return !this.context.land.tilemap.layers.some((layer) => {
      return this.context.land.tilemap.hasTileAt(pos.x, pos.y, layer.name);
    });
  }

  /*
    LAND BLOCK METHODS
  */
  private reactToLandBlockTouch() {
    const pos = this.player.getGridPosition();

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
