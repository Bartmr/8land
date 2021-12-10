export type LandSceneArguments = {
  player: {
    spritesheetUrl: string;
  };
  land: Land;
  // To be able to escape a malformed territory
  // is set when going into a non isBaseLand land
  // is null when going back into a isBaseLand land
  lastBaseLandDoorBlock: DoorBlock | null;

  // To position player after he entered a door
  comingFromDoorBlock: DoorBlock;
};

export type Land = {
  id: string;
  backgroundMusicUrl: string | null;
  isBaseLand: boolean;
  tilesetUrl: string;
  tilemapTiledJSONUrl: string;
  blocks: Block[];
  territories: Array<{
    id: string;
    tilesetUrl: string;
    tilemapTiledJSONUrl: string;
    startX: number;
    startY: number;
    blocks: Block[];
  }>;
};

export type Block =
  | {
      type: BlockType.Other;
      id: string;
    }
  | DoorBlock;

export type DoorBlock = {
  type: BlockType.Door;
  id: string;
  // Outside the next room
  land_a: string;
  // Inside the next room
  land_b: string;
};

export enum BlockType {
  Door = 'door',
  Other = 'other',
}
