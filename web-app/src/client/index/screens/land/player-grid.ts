import { TILE_SIZE } from '../../game-constants';
import { Block, DoorBlock } from './land-scene.types';
import { DialogueService } from '../dialogue/dialogue-screen';
import { DynamicBlockType } from '../../../../main-api/routes/blocks/blocks-api';
import {
  StaticBlockType,
  STATIC_BLOCK_TYPE_VALUES,
} from '../../../../main-api/routes/lands/lands-api';
import { KeypadBroker } from '../../keypad-broker';
import { throwError } from '../../../../throw-error';
import { PlayerSprite } from './player-sprite';
import { Math } from 'phaser';

export enum Direction {
    NONE = 'none',
    LEFT = 'left',
    UP = 'up',
    RIGHT = 'right',
    DOWN = 'down'
  }

const DIRECTION_TO_VECTOR: {
  [key in Direction]?: Math.Vector2;
} = {
  [Direction.UP]: Math.Vector2.UP,
  [Direction.DOWN]: Math.Vector2.DOWN,
  [Direction.LEFT]: Math.Vector2.LEFT,
  [Direction.RIGHT]: Math.Vector2.RIGHT,
};

export type PlayerGridLandContext = {
  land: {
    id: string;
    tilemap: Phaser.Tilemaps.Tilemap;
    blocks: Block[];
  };
  onStepIntoDoor: (
    block:
      | DoorBlock
      | { type: StaticBlockType.Start }
      | { type: StaticBlockType.TrainPlatform },
  ) => void;
  onOpenApp: (args: {
    url: string;
    territoryId: string | undefined;
  }) => void;
  dialogueService: DialogueService;
}

export class PlayerGrid {

  private movingDirection: Direction = Direction.NONE;
  private facingDirection: Direction = Direction.DOWN;

  private tileSizePixelsWalked: number = 0;

  private hasSteppedOnSafeTile = false;

  constructor(
    private playerSprite: PlayerSprite,
    private keypadBroker: KeypadBroker,
    private playerPositionLandContext: PlayerGridLandContext,
    private gridPosition: Math.Vector2
  ) {

  }

  update(delta: number) {
    //
    // CONTINUE PREVIOUS ACTIONS
    //
    if (this.isMoving()) {
      const pixelsToWalkThisUpdate = this.getPixelsToWalkThisUpdate(delta);

      if (this.willWalkOverANewTile(pixelsToWalkThisUpdate)) {
        if (this.shouldContinueMovingInSameDirection()) {
          this.setPlayerSpritePosition(pixelsToWalkThisUpdate);
          this.changePlayerGridPosition();
        } else {
          this.setPlayerSpritePosition(TILE_SIZE - this.tileSizePixelsWalked);
          this.stopMoving();
        }

        this.reactToCurrentTile();
      } else {
        this.setPlayerSpritePosition(pixelsToWalkThisUpdate);
      }
    }

    //
    // TRIGGER NEW ACTIONS BASED ON BUTTONS PRESSED
    //
    const pressingLeft = this.keypadBroker.getDirection() === Direction.LEFT;
    const pressingRight = this.keypadBroker.getDirection() === Direction.RIGHT;
    const pressingUp = this.keypadBroker.getDirection() === Direction.UP;
    const pressingDown = this.keypadBroker.getDirection() === Direction.DOWN;

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

    if (this.keypadBroker.isAPressed()) {
      this.searchForActionInFrontOfCharacter();
    }
  }

  private movePlayer(direction: Direction): void {
    if (this.isMoving()) return;

    if (this.willCollideInNextBlock(direction)) {
      this.playerSprite.stopAnimation(direction);
    } else {
      this.playerSprite.startAnimation(direction);
      this.movingDirection = direction;
      this.changePlayerGridPosition();
    }
  }

  private isMoving(): boolean {
    return this.movingDirection !== Direction.NONE;
  }

  private changePlayerGridPosition() {
    this.gridPosition = this.gridPosition.clone().add(DIRECTION_TO_VECTOR[this.movingDirection] || throwError())
  }

  private setPlayerSpritePosition(pixelsToMove: number) {
    const directionVec = (
      DIRECTION_TO_VECTOR[this.movingDirection] || throwError()
    ).clone();
    const movementDistance = directionVec.multiply(new Math.Vector2(pixelsToMove));

    this.playerSprite.setPosition(
      this.playerSprite.getPosition().add(movementDistance),
    );

    this.tileSizePixelsWalked = (this.tileSizePixelsWalked + pixelsToMove) % TILE_SIZE;
  }

  private getPixelsToWalkThisUpdate(delta: number): number {
    const deltaInSeconds = delta / 1000;

    const pixelsPerSecond = TILE_SIZE * 4;

    return pixelsPerSecond * deltaInSeconds;
  }

  private stopMoving(): void {
    this.playerSprite.stopAnimation(this.movingDirection);
    this.movingDirection = Direction.NONE;
  }

  private willWalkOverANewTile(pixelsToWalkThisUpdate: number): boolean {
    return this.tileSizePixelsWalked + pixelsToWalkThisUpdate >= TILE_SIZE;
  }

  private shouldContinueMovingInSameDirection(): boolean {
    return (
      this.movingDirection === this.keypadBroker.getDirection() &&
      !this.willCollideInNextBlock(this.keypadBroker.getDirection())
    );
  }

  private willCollideInNextBlock(direction: Direction): boolean {
    const pos = this.getNextTilePosition(direction);

    if (this.isOutsideLandBoundaries(pos)) return true;

    const topTileProps = this.getTopTileProperties(pos);

    return !!topTileProps?.static.collides;
  }

  private getNextTilePosition(direction: Direction): Math.Vector2 {
    return this.gridPosition.clone()
      .add(DIRECTION_TO_VECTOR[direction] || throwError());
  }

  private isOutsideLandBoundaries(pos: Math.Vector2): boolean {
    return !this.playerPositionLandContext.land.tilemap.layers.some((layer) => {
      return this.playerPositionLandContext.land.tilemap.hasTileAt(pos.x, pos.y, layer.name);
    });
  }

  private getTopTileProperties(pos: Math.Vector2) {
    const resolveTileProps = (
      tile: Phaser.Tilemaps.Tile,
      inTerritoryId: string | undefined,
    ) => {
      let foundATopTileWithProps = false;
      const properties: {
        inTerritoryId: undefined | string;
        static: {
          collides?: boolean;
          text?: string;
          train?: boolean;
          start?: boolean;
        };
        dynamicBlock?: {
          type: string | undefined;
          id: string | undefined;
        };
      } = {
        inTerritoryId,
        static: {},
      };

      const tileProperties = tile.properties as {
        [key: string]: unknown;
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

      if (tileProperties[StaticBlockType.Start]) {
        properties.static.start = true;
        foundATopTileWithProps = true;
      }

      if (tileProperties[StaticBlockType.TrainPlatform]) {
        properties.static.train = true;
        foundATopTileWithProps = true;
      }

      const firstBlockEntry = Object.entries(tileProperties)
        .filter((c) => ![STATIC_BLOCK_TYPE_VALUES].includes(c[0] as any))
        .find((c): c is [string, string] => typeof c[1] === 'string');

      if (firstBlockEntry) {
        const firstBlockIdSplitted = firstBlockEntry[1].split(':');

        properties.dynamicBlock = {
          type: firstBlockIdSplitted[0],
          id: firstBlockIdSplitted[1],
        };

        foundATopTileWithProps = true;
      }

      if (foundATopTileWithProps) {
        return properties;
      } else {
        return undefined;
      }
    };

    for (const layer of this.playerPositionLandContext.land.tilemap.layers) {
      const tile = this.playerPositionLandContext.land.tilemap.getTileAt(
        pos.x,
        pos.y,
        false,
        layer.name,
      ) as Phaser.Tilemaps.Tile | null;

      if (!tile) {
        continue;
      }

      const props = resolveTileProps(tile, undefined);

      if (props) {
        return props;
      }
    }

    return undefined;
  }

  private reactToCurrentTile() {
    const pos = this.gridPosition.clone();

    const tileProps = this.getTopTileProperties(pos);

    if (tileProps) {
      const dynamicBlock = tileProps.dynamicBlock;

      if (dynamicBlock) {
        const block = this.playerPositionLandContext.land.blocks.find(
          (b) => b.type === dynamicBlock.type && b.id === dynamicBlock.id,
        );

        if (block) {
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          if (block.type === DynamicBlockType.Door) {
            if (this.hasSteppedOnSafeTile) {
              this.playerPositionLandContext.onStepIntoDoor(block);
            }

            this.hasSteppedOnSafeTile = false;
          }
        }
      } else if (tileProps.static.start) {
        if (this.hasSteppedOnSafeTile) {
          this.playerPositionLandContext.onStepIntoDoor({ type: StaticBlockType.Start });
        }

        this.hasSteppedOnSafeTile = false;
      } else if (tileProps.static.train) {
        if (this.hasSteppedOnSafeTile) {
          this.playerPositionLandContext.onStepIntoDoor({ type: StaticBlockType.TrainPlatform });
        }

        this.hasSteppedOnSafeTile = false;
      } else {
        this.hasSteppedOnSafeTile = true;
      }
    } else {
      this.hasSteppedOnSafeTile = true;
    }
  }

  private searchForActionInFrontOfCharacter() {
    const pos = this.getNextTilePosition(this.facingDirection);

    const props = this.getTopTileProperties(pos);

    if (props?.static.text) {
      this.playerPositionLandContext.dialogueService.openText(props.static.text);
    } else {
      const dynamicBlock = props?.dynamicBlock;

      if (dynamicBlock) {
        const block = this.playerPositionLandContext.land.blocks.find(
          (b) => b.type === dynamicBlock.type && b.id === dynamicBlock.id,
        );

        if (block) {
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          if (block.type === DynamicBlockType.App) {
            this.playerPositionLandContext.onOpenApp({
              url: block.url,
              territoryId: props.inTerritoryId,
            });
          }
        }
      }
    }
  }
}



