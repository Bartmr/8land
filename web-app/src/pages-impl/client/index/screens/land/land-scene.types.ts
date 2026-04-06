import { DynamicBlockType } from '../../../../../main-api/routes/blocks/create/create-block.schemas';
import { StaticBlockType } from '../../../../../main-api/routes/lands/upload-assets/upload-land-assets.schemas';
import { GetLandDTO } from '../../../../../main-api/routes/lands/lands.dtos';
import { UserAuthSessionData } from '../../../../../users/auth/user-auth-types';

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
