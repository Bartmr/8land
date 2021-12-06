import * as Phaser from 'phaser';
import { LandScene } from './land-scene';

const gameConfig: Phaser.Types.Core.GameConfig = {
  title: 'Sample',
  render: {
    antialias: false,
  },
  type: Phaser.AUTO,
  scene: LandScene,
  scale: {
    width: 160,
    height: 144,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    mode: Phaser.Scale.WIDTH_CONTROLS_HEIGHT,
  },
  parent: 'game-root',
  backgroundColor: '#000000',
};

export async function runGame() {
  const game = new Phaser.Game(gameConfig);

  return game;
}
