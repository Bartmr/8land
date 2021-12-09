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

  const land = {
    id: '1',
    backgroundMusicUrl: 'https://api.soundcloud.com/tracks/256813580',
    tilesetUrl: 'land-scene-tileset.png',
    tilemapTiledJSONUrl: 'land-scene-map.json',
    territories: [
      {
        id: '1',
        tilesetUrl: 'territory-tileset.png',
        tilemapTiledJSONUrl: 'territory-map.json',
        startX: 5,
        startY: 6,
      },
    ],
  };

  const game = new Phaser.Game(gameConfig);

  const sceneKey = `land-scene:scene:${land.id}`;

  game.scene.add(
    sceneKey,
    new LandScene(
      null,
      {
        player,
        land,
      },
      {
        musicProvider: dependencies.musicProvider,
      },
    ),
  );

  game.scene.start(sceneKey);

  return game;
}
