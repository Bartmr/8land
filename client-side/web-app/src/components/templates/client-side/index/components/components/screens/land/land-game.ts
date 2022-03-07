import { GetLandDTO } from '@app/shared/land/get/get-land.dto';
import * as Phaser from 'phaser';
import { JSONApiBase } from 'src/logic/app-internals/apis/json-api-base';
import { MainApiSessionData } from 'src/logic/app-internals/apis/main/session/main-api-session-types';
import { EnvironmentVariables } from 'src/logic/app-internals/runtime/environment-variables';
import { getLandSceneKey } from './keys';
import { LandScene } from './land-scene';
import sample from 'lodash/sample';
import { BlockType, DoorBlock } from './land-scene.types';
import { throwError } from '@app/shared/internals/utils/throw-error';
import { MusicService } from '../../music-ticker';

export async function runLandGame(
  args: { land: GetLandDTO; session: null | MainApiSessionData },
  dependencies: {
    musicService: MusicService;
    api: JSONApiBase;
    changeLandNameDisplay: (landName: string) => void;
  },
) {
  const gameConfig: Phaser.Types.Core.GameConfig = {
    title: 'Sample',
    render: {
      antialias: false,
    },
    pixelArt: true,
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
    input: false,
    powerPreference: 'low-power',
  };

  const player = {
    spritesheetUrl: `${EnvironmentVariables.HOST_URL}/player.png`,
  };

  const game = new Phaser.Game(gameConfig);

  const sceneKey = getLandSceneKey(args.land);

  let comingFromDoorBlock: DoorBlock;

  if (args.land.doorBlocksReferencing.length > 0) {
    const el = sample(args.land.doorBlocksReferencing) || throwError();

    comingFromDoorBlock = {
      type: BlockType.Door,
      toLandId: el.fromLandId,
      id: el.id,
    };
  } else if (args.land.doorBlocks.length > 0) {
    const el = sample(args.land.doorBlocks) || throwError();

    comingFromDoorBlock = {
      type: BlockType.Door,
      toLandId: el.toLand.id,
      id: el.id,
    };
  } else {
    throw new Error();
  }

  game.scene.add(
    sceneKey,
    new LandScene(
      null,
      {
        player,
        land: {
          ...args.land,
          territories: args.land.territories.filter((t) => !!t.assets),
        },
        comingFromDoorBlock,
      },
      dependencies,
    ),
  );

  game.scene.start(sceneKey);

  return game;
}
