import { GetLandDTO } from '@app/shared/land/get/get-land.dto';
import { BlockType } from '@app/shared/land/blocks/create/create-block.enums';

export type LandSceneArguments = {
  player: {
    spritesheetUrl: string;
  };
  land: GetLandDTO;

  // To position player after he entered a door
  comingFromDoorBlock: DoorBlock;
};

export type Block = DoorBlock;

export type DoorBlock = {
  type: BlockType.Door;
  id: string;
  toLandId: string;
};

export { BlockType };
