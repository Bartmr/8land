import { GetLandDTO } from '@app/shared/land/get/get-land.dto';
import { BlockType } from '@app/shared/blocks/create/create-block.enums';
import { MainApiSessionData } from 'src/logic/app-internals/apis/main/session/main-api-session-types';

export type LandSceneArguments = {
  player: {
    spritesheetUrl: string;
  };
  land: GetLandDTO;

  // To position player after he entered a door
  comingFromDoorBlock: DoorBlock;

  session: null | MainApiSessionData;
};

export type Block = DoorBlock | AppBlock;

export type DoorBlock = {
  type: BlockType.Door;
  id: string;
  toLandId: string;
};

export type AppBlock = {
  type: BlockType.App;
  id: string;
  url: string;
};

export { BlockType };
