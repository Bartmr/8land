import * as Phaser from 'phaser';
import { JSONApiBase } from 'src/logic/app-internals/apis/json-api-base';
import { MainApiSessionData } from 'src/logic/app-internals/apis/main/session/main-api-session-types';
import { EnvironmentVariables } from 'src/logic/app-internals/runtime/environment-variables';
import { getLandSceneKey } from './keys';
import { LandScene } from './land-scene';
import { BlockType, DoorBlock } from './land-scene.types';
import { throwError } from '@app/shared/internals/utils/throw-error';
import { MusicService } from '../../music-ticker';
import { DialogueService } from '../dialogue/dialogue-screen';
import { LandScreenService } from './land-screen.service';
import { AppService } from '../app/app-screen';
import { ResumeLandNavigationDTO } from '@app/shared/land/in-game/resume/resume-land-navigation.dto';

export async function runLandGame(
  args: {
    resumedLand: ResumeLandNavigationDTO;
    session: null | MainApiSessionData;
  },
  dependencies: {
    musicService: MusicService;
    dialogueService: DialogueService;
    appService: AppService;
    api: JSONApiBase;
    changeLandNameDisplay: (landName: string) => void;
    landScreenService: LandScreenService;
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

  const sceneKey = getLandSceneKey(args.resumedLand);

  let comingFromDoorBlock: DoorBlock;

  if (args.resumedLand.lastDoor) {
    comingFromDoorBlock = {
      type: BlockType.Door,
      id: args.resumedLand.lastDoor.id,
      toLandId: args.resumedLand.lastDoor.toLandId,
    };
  }
  // This is how we position the user when starting from scratch
  else if (args.resumedLand.doorBlocksReferencing.length > 0) {
    const el = args.resumedLand.doorBlocksReferencing[0] || throwError();

    comingFromDoorBlock = {
      type: BlockType.Door,
      toLandId: el.fromLandId,
      id: el.id,
    };
  } else {
    throw new Error();
  }

  if (args.resumedLand.lastDoorWasDeleted) {
    window.alert(
      'The land you were previously in has changed. You were transported to closest known location you were in.',
    );
  }

  game.scene.add(
    sceneKey,
    new LandScene(
      null,
      {
        player,
        land: {
          ...args.resumedLand,
          territories: args.resumedLand.territories.filter((t) => !!t.assets),
        },
        comingFromDoorBlock,
        session: args.session,
      },
      dependencies,
    ),
  );

  game.scene.start(sceneKey);

  dependencies.landScreenService.game = game;
}
