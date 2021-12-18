import * as Phaser from 'phaser';
import { EnvironmentVariables } from 'src/logic/app-internals/runtime/environment-variables';
import { getLandSceneKey } from './keys';
import { LandScene } from './land-scene';
import { LAND_1, START_BLOCK } from './mocks';
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
      mode: Phaser.Scale.WIDTH_CONTROLS_HEIGHT,
      autoCenter: Phaser.Scale.Center.CENTER_HORIZONTALLY,
    },
    parent: 'game-root',
    backgroundColor: '#000000',
    canvasStyle:
      'border-color: var(--body-contrasting-color); border-width: 3px; border-style: solid;',
    loader: {
      baseURL: EnvironmentVariables.HOST_URL,
    },
  };

  const player = {
    spritesheetUrl: 'player.png',
  };

  const game = new Phaser.Game(gameConfig);

  const sceneKey = getLandSceneKey(LAND_1);

  game.scene.add(
    sceneKey,
    new LandScene(
      null,
      {
        player,
        land: LAND_1,
        lastBaseLandDoorBlock: null,
        comingFromDoorBlock: START_BLOCK,
      },
      {
        musicProvider: dependencies.musicProvider,
      },
    ),
  );

  game.scene.start(sceneKey);

  return game;
}
