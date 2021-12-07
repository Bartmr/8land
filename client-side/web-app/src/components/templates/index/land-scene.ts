import { throwError } from '@app/shared/internals/utils/throw-error';
import { HotReloadClass } from 'src/logic/app-internals/utils/hot-reload-class';
import { GridControls } from './grid-controls';
import { GridPhysics } from './grid-physics';
import { Direction } from './grid.types';
import { MusicProvider } from './music-provider.types';
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
  protected musicProvider: MusicProvider;

  // Populated when loading plugin
  private animatedTiles = null as unknown as {
    init(map: Phaser.Tilemaps.Tilemap): void;
    resetRates(mapIndex: number): void;
    setRate(rate: number, gid?: number, map?: Phaser.Tilemaps.Tilemap): void;
    resume(layerIndex: number, mapIndex: number): void;
    pause(layerIndex: number, mapIndex: number): void;
  };

  constructor(musicProvider: MusicProvider) {
    super(SCENE_CONFIG);

    this.musicProvider = musicProvider;
  }

  public create() {
    const map = this.make.tilemap({ key: 'map' });
    map.addTilesetImage(
      // tileset name in Tiled json
      'land-scene-tileset',
      'tileset',
    );

    const layer = map.createLayer(0, 'land-scene-tileset', 0, 0);
    layer.setDepth(0);

    this.animatedTiles.init(map);

    const playerSprite = this.add.sprite(0, 0, 'player');
    playerSprite.setDepth(2);

    this.cameras.main.startFollow(playerSprite);
    this.cameras.main.roundPixels = true;
    this.cameras.main.setBounds(0, 0, layer.width, layer.height);

    const player = new Player(playerSprite, new Phaser.Math.Vector2(6, 13));

    this.gridPhysics = new GridPhysics(player, map);
    this.gridControls = new GridControls(this.input, this.gridPhysics);

    this.createPlayerAnimation(Direction.UP, 9, 8);
    this.createPlayerAnimation(Direction.RIGHT, 1, 0);
    this.createPlayerAnimation(Direction.DOWN, 6, 5);
    this.createPlayerAnimation(Direction.LEFT, 3, 2);
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

    /*
      From https://github.com/nkholski/phaser-animated-tiles/blob/master/dist/AnimatedTiles.js
      commit a10cc9f on May 26, 2018
    */
    this.load.scenePlugin(
      'AnimatedTiles',
      'AnimatedTiles.js',
      'animatedTiles',
      'animatedTiles',
    );

    // https://soundcloud.com/radion-alexievich-drozdov/spacedandywave?in=eliud-makaveli-zavala/sets/vaporwave
    this.musicProvider.playFromSoundcloud(
      'https://api.soundcloud.com/tracks/256813580',
    );
  }

  private createPlayerAnimation(
    name: string,
    startFrame: number,
    endFrame: number,
  ) {
    this.anims.create({
      key: name,
      frames: this.anims.generateFrameNumbers('player', {
        start: startFrame,
        end: endFrame,
      }),
      frameRate: 8,
      repeat: -1,
      yoyo: true,
    });
  }
}
