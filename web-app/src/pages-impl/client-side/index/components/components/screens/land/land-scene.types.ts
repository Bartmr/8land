import {
  DynamicBlockType,
  StaticBlockType,
} from '@shared/blocks/create/create-block.enums';
import { GetLandDTO } from '@shared/land/get/get-land.dto';
import { MainApiSessionData } from 'src/main-api/session/main-api-session-types';

export type LandSceneArguments = {
  player: {
    spritesheetUrl: string;
  };
  land: GetLandDTO;

  // To position player after he entered a door
  comingFrom:
    | DoorBlock
    | { type: StaticBlockType.Start }
    | { type: StaticBlockType.TrainPlatform };

  session: null | MainApiSessionData;
};

export type Block = DoorBlock | AppBlock;

export type DoorBlock = {
  type: DynamicBlockType.Door;
  id: string;
  toLandId: string;
};

export type AppBlock = {
  type: DynamicBlockType.App;
  id: string;
  url: string;
};
