import { DynamicBlockType } from '../../../../../main-api/routes/blocks/blocks-api';
import { StaticBlockType } from '../../../../../main-api/routes/lands/lands-api';
import { GetLandDTO } from '../../../../../main-api/routes/lands/lands-api';
import { UserAuthSessionData } from '../../../../../users/authentication/user-auth-types';

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

  session: null | UserAuthSessionData;
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
