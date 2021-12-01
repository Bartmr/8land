import { throwError } from '@app/shared/internals/utils/throw-error';
import { HotReloadClass } from 'src/logic/app-internals/utils/hot-reload-class';
import { GridControls } from './grid-controls';
import { GridPhysics } from './grid-physics';
import { Player } from './player';

const SCENE_CONFIG: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  visible: false,
  key: 'LandScene',
};

@HotReloadClass(module)
export class LandScene extends Phaser.Scene {
  private gridControls?: GridControls;
  private gridPhysics?: GridPhysics;

  constructor() {
    super(SCENE_CONFIG);
  }

  public create() {
    const scene = this.make.tilemap({ key: 'map' });
    const tileset = scene.addTilesetImage(
      // tileset name in Tiled json
      'land-scene-tileset',
      'tileset',
    );

    if (!scene.layers[0]) {
      throw new Error();
    }

    const layer = scene.createLayer(0, tileset, 0, 0);

    //
    const playerSprite = this.add.sprite(0, 0, 'player');
    playerSprite.setDepth(2);
    this.cameras.main.startFollow(playerSprite);
    this.cameras.main.roundPixels = true;
    this.cameras.main.setBounds(0, 0, layer.width, layer.height);
    const player = new Player(playerSprite, new Phaser.Math.Vector2(0, 0));
    //
    this.gridPhysics = new GridPhysics(player);
    this.gridControls = new GridControls(this.input, this.gridPhysics);
  }

  public update(_time: number, delta: number) {
    (this.gridControls || throwError()).update();
    (this.gridPhysics || throwError()).update(delta);
  }

  public preload() {
    this.load.image('tileset', 'land-scene-tileset.png');
    this.load.tilemapTiledJSON('map', 'land-scene-map.json');

    this.load.spritesheet('player', 'player.png', {
      frameWidth: 16,
      frameHeight: 16,
    });
  }
}
