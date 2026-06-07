import { Scene } from 'phaser';
import { throwError } from '../../../../../throw-error';
import { TILE_SIZE } from '../../game-constants';
import { LandScene } from './land-scene';
import { Direction, PlayerGrid, PlayerGridLandContext } from "./player-grid";
import { PlayerSprite } from './player-sprite';
import { KeypadBroker } from '../../keypad-broker';

export class Player {
  public playerGrid: PlayerGrid;

  constructor(
    land: LandScene,
    depth: number,
    gridPosition: Phaser.Math.Vector2,
    keypadBroker: KeypadBroker,
    playerPositionLandContext: PlayerGridLandContext,
  ) {
    const playerSprite = new PlayerSprite(land, depth, gridPosition);

    this.playerGrid = new PlayerGrid(
      playerSprite,
      keypadBroker,
      playerPositionLandContext,
      gridPosition
    )
  }
  
}
