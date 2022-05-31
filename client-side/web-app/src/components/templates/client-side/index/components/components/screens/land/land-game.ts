import * as Phaser from 'phaser';
import { MainApiSessionData } from 'src/logic/app-internals/apis/main/session/main-api-session-types';
import { EnvironmentVariables } from 'src/logic/app-internals/runtime/environment-variables';
import { getLandSceneKey } from './keys';
import { LandScene } from './land-scene';
import { LandSceneArguments } from './land-scene.types';
import { throwError } from '@app/shared/internals/utils/throw-error';
import { MusicService } from '../../music-ticker';
import { DialogueService } from '../dialogue/dialogue-screen';
import { LandScreenService } from './land-screen.service';
import { AppService } from '../app/app-screen';
import { ResumeLandNavigationDTO } from '@app/shared/land/in-game/resume/resume-land-navigation.dto';
import {
  DynamicBlockType,
  StaticBlockType,
} from '@app/shared/blocks/create/create-block.enums';
import { LandsAPI } from 'src/logic/lands/lands-api';

export async function runLandGame(
  args: {
    resumedLand: ResumeLandNavigationDTO;
    session: null | MainApiSessionData;
  },
  dependencies: {
    musicService: MusicService;
    dialogueService: DialogueService;
    appService: AppService;
    landsAPI: LandsAPI;
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

  let comingFrom: LandSceneArguments['comingFrom'];

  if (args.resumedLand.lastDoor) {
    comingFrom = {
      type: DynamicBlockType.Door,
      id: args.resumedLand.lastDoor.id,
      toLandId: args.resumedLand.lastDoor.toLandId,
    };
  } else if (args.resumedLand.lastTrainTravel) {
    if (args.resumedLand.lastTrainTravel.comingBackToStation) {
      comingFrom = {
        type: StaticBlockType.TrainPlatform,
      };
    } else {
      comingFrom = {
        type: StaticBlockType.Start,
      };
    }
  }
  // This is how we position the user when starting from scratch
  else if (args.resumedLand.doorBlocksReferencing.length > 0) {
    const el = args.resumedLand.doorBlocksReferencing[0] || throwError();

    comingFrom = {
      type: DynamicBlockType.Door,
      toLandId: el.fromLandId,
      id: el.id,
    };
  } else {
    throw new Error();
  }

  if (args.resumedLand.lastCheckpointWasDeleted) {
    window.alert(
      'The land you were previously in was moved or deleted. You were teleported back to the train station.',
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
        comingFrom: comingFrom,
        session: args.session,
      },
      dependencies,
    ),
  );

  game.scene.start(sceneKey);

  dependencies.landScreenService.game = game;
}
