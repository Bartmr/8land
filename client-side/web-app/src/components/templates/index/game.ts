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
    scene: [new LandScene(dependencies.musicProvider)],
    scale: {
      width: 160,
      height: 144,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      mode: Phaser.Scale.WIDTH_CONTROLS_HEIGHT,
    },
    parent: 'game-root',
    backgroundColor: '#000000',
  };

  const game = new Phaser.Game(gameConfig);

  return game;
}
