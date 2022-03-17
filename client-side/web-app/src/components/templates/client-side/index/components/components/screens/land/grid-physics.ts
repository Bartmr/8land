import { throwError } from '@app/shared/internals/utils/throw-error';
import { HotReloadClass } from 'src/logic/app-internals/utils/hot-reload-class';
import { TILE_SIZE } from '../../../../game-constants';
import { Direction } from './grid.types';
import { Block, BlockType, DoorBlock } from './land-scene.types';
import { Player } from './player';
import { GamepadSingleton, GamepadType } from '../../../../gamepad-singleton';
import { JSONPrimitive } from '@app/shared/internals/transports/json-types';
import { DialogueService } from '../dialogue/dialogue-screen';

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
  private gamePad: GamepadType;

  private isLocked = false;
  private directionsAreLocked = false;

  private movingDirection: Direction = Direction.NONE;
  private facingDirection: Direction = Direction.DOWN;

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
      dialogueService: DialogueService;
    },
  ) {
    this.gamePad = GamepadSingleton.getInstance();
  }

  lock() {
    this.isLocked = true;
  }

  unlock() {
    this.isLocked = false;
  }

  update(delta: number) {
    if (this.isLocked || this.context.dialogueService.lockCurrentScreen) {
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
    const pressingLeft = this.gamePad.getDirection() === Direction.LEFT;
    const pressingRight = this.gamePad.getDirection() === Direction.RIGHT;
    const pressingUp = this.gamePad.getDirection() === Direction.UP;
    const pressingDown = this.gamePad.getDirection() === Direction.DOWN;

    if (pressingLeft) {
      this.facingDirection = Direction.LEFT;
      this.movePlayer(Direction.LEFT);
    } else if (pressingRight) {
      this.facingDirection = Direction.RIGHT;
      this.movePlayer(Direction.RIGHT);
    } else if (pressingUp) {
      this.facingDirection = Direction.UP;
      this.movePlayer(Direction.UP);
    } else if (pressingDown) {
      this.facingDirection = Direction.DOWN;
      this.movePlayer(Direction.DOWN);
    } else {
      // user wants to stop by not pressing any key
    }

    if (this.gamePad.isAPressed()) {
      this.searchForActionInFrontOfCharacter();
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

      this.reactToCurrentTile();
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
      this.movingDirection === this.gamePad.getDirection() &&
      !this.willCollideInNextBlock(this.gamePad.getDirection())
    );
  }

  private willCollideInNextBlock(direction: Direction): boolean {
    const pos = this.getNextTilePosition(direction);

    if (this.isOutsideLandBoundaries(pos)) return true;

    const topTileProps = this.getTopTileProperties(pos);

    return !!topTileProps?.static.collides;
  }

  private getNextTilePosition(direction: Direction): Phaser.Math.Vector2 {
    return this.player
      .getGridPosition()
      .add(DIRECTION_TO_VECTOR[direction] || throwError());
  }

  private isOutsideLandBoundaries(pos: Phaser.Math.Vector2): boolean {
    return !this.context.land.tilemap.layers.some((layer) => {
      return this.context.land.tilemap.hasTileAt(pos.x, pos.y, layer.name);
    });
  }

  private getTopTileProperties(pos: Phaser.Math.Vector2) {
    const resolveTileProps = (tile: Phaser.Tilemaps.Tile) => {
      let foundATopTileWithProps = false;
      const properties: {
        static: {
          collides?: boolean;
          text?: string;
        };
        blockId?: string;
      } = {
        static: {},
      };

      const tileProperties = tile.properties as {
        [key: string]: JSONPrimitive;
      };

      if (tileProperties['collides']) {
        properties.static.collides = true;
        foundATopTileWithProps = true;
      }

      if (tileProperties['text']) {
        const text = tileProperties['text'];

        if (typeof text !== 'string') {
          throw new Error();
        }

        properties.static.text = text;
        foundATopTileWithProps = true;
      }

      const firstBlockId = Object.entries(tileProperties)
        .filter((c) => !['collides', 'text'].includes(c[0]))
        .find((c) => c[1]);

      if (firstBlockId) {
        properties.blockId = firstBlockId[0];
        foundATopTileWithProps = true;
      }

      if (foundATopTileWithProps) {
        return properties;
      } else {
        return undefined;
      }
    };

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

        const props = resolveTileProps(tile);

        if (props) {
          return props;
        }
      }
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

      const props = resolveTileProps(tile);

      if (props) {
        return props;
      }
    }

    return undefined;
  }

  private reactToCurrentTile() {
    const pos = this.player.getGridPosition();

    const tileProps = this.getTopTileProperties(pos);

    if (tileProps) {
      if (!this.hasSteppedOnSafeTile) {
        return;
      }

      const blockId = tileProps.blockId;

      if (blockId) {
        const block = this.context.land.blocks.find((b) => blockId === b.id);

        if (block) {
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          if (block.type === BlockType.Door) {
            this.context.onStepIntoDoor(block);
          }
        }
      }
    } else {
      this.hasSteppedOnSafeTile = true;
    }
  }

  private searchForActionInFrontOfCharacter() {
    const pos = this.getNextTilePosition(this.facingDirection);

    const props = this.getTopTileProperties(pos);

    if (props?.static.text) {
      this.context.dialogueService.openText(props.static.text);
    }
  }
}

export { GridPhysics };