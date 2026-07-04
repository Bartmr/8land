import { GameObjects, Math } from "phaser";
import { throwError } from "../../../../throw-error";
import { TILE_SIZE } from "../../game-constants";
import { LandScene } from "./land-scene";
import { Direction } from "./player-grid";
import { v4 } from "uuid";

export class PlayerSprite {
  private id: string;
  private sprite: GameObjects.Sprite;

  constructor(
    scene: LandScene,
    depth: number,
    position: Math.Vector2
  ) {
    this.id = v4();
    this.sprite = scene.add.sprite(0, 0, 'player');
    this.sprite.setDepth(depth);

    const landTiledJSON = scene.getLandTiledJSON()

    scene.cameras.main.startFollow(this.sprite);
    scene.cameras.main.roundPixels = true;
    scene.cameras.main.setBounds(
      0,
      0,
      landTiledJSON.width * TILE_SIZE,
      landTiledJSON.height * TILE_SIZE,
    );

    
    const offsetX = TILE_SIZE / 2;
    const offsetY = TILE_SIZE;

    this.sprite.setOrigin(0.5, 1);
    this.sprite.setPosition(
      position.x * TILE_SIZE + offsetX,
      position.y * TILE_SIZE + offsetY,
    );
    this.sprite.setFrame(4);

    scene.anims.create({
      key: `player:${this.id}:${Direction.UP}`,
      frames: scene.anims.generateFrameNumbers('player', {
        start: 9,
        end: 8,
      }),
      frameRate: 8,
      repeat: -1,
      yoyo: true,
    });

    scene.anims.create({
      key: `player:${this.id}:${Direction.RIGHT}`,
      frames: scene.anims.generateFrameNumbers('player', {
        start: 1,
        end: 0,
      }),
      frameRate: 8,
      repeat: -1,
      yoyo: true,
    });

    scene.anims.create({
      key: `player:${this.id}:${Direction.DOWN}`,
      frames: scene.anims.generateFrameNumbers('player', {
        start: 6,
        end: 5,
      }),
      frameRate: 8,
      repeat: -1,
      yoyo: true,
    });

    scene.anims.create({
      key: `player:${this.id}:${Direction.LEFT}`,
      frames: scene.anims.generateFrameNumbers('player', {
        start: 3,
        end: 2,
      }),
      frameRate: 8,
      repeat: -1,
      yoyo: true,
    });
  }


 

  getPosition(): Math.Vector2 {
    return this.sprite.getBottomCenter();
  }

  setPosition(position: Math.Vector2): void {
    this.sprite.setPosition(position.x, position.y);
  }

  stopAnimation(direction: Direction) {
    const animationManager = this.sprite.anims.animationManager;
    const standingFrame = (
      animationManager.get(`player:${this.id}:${direction}`).frames[1] || throwError()
    ).frame.name;
    this.sprite.anims.stop();
    this.sprite.setFrame(standingFrame);
  }

  startAnimation(direction: Direction) {
    this.sprite.anims.play(`player:${this.id}:${direction}`);
  }
}