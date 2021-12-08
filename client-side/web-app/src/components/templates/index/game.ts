import * as Phaser from 'phaser';
import { LandScene } from './land-scene';
import { MusicProvider } from './music-provider.types';

export async function runGame(dependencies: { musicProvider: MusicProvider }) {
  const gameConfig: Phaser.Types.Core.GameConfig = {
    title: 'Sample',
    render: {
      antialias: false,
    },
    // pixelArt: true,
    type: Phaser.AUTO,

    scale: {
      width: 160,
      height: 144,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      mode: Phaser.Scale.WIDTH_CONTROLS_HEIGHT,
    },
    parent: 'game-root',
    backgroundColor: '#000000',
  };

  const player = {
    spritesheetUrl: 'player.png',
  };

  const landScene = {
    id: '1',
    backgroundMusicUrl: 'https://api.soundcloud.com/tracks/256813580',
    tilesetUrl: 'land-scene-tileset.png',
    tilemapTiledJSONUrl: 'land-scene-map.json',
    // territories: [
    //   {
    //     id: '1',
    //     tilesetUrl: 'land-scene-tileset.png',
    //     tilemapTiledJSONUrl: 'land-scene-map.json',
    //   }
    // ]
  };

  const game = new Phaser.Game(gameConfig);

  const sceneKey = `land-scene:${landScene.id}`;

  game.scene.add(
    sceneKey,
    new LandScene(
      {
        previousLandSceneKey: null,
        player,
        landScene,
      },
      {
        musicProvider: dependencies.musicProvider,
      },
    ),
  );

  game.scene.start(sceneKey);

  return game;
}
