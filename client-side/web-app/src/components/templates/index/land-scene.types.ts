export type LandSceneArguments = {
  player: {
    spritesheetUrl: string;
  };
  land: {
    id: string;
    backgroundMusicUrl: string;
    tilesetUrl: string;
    tilemapTiledJSONUrl: string;
    territories: Array<{
      id: string;
      tilesetUrl: string;
      tilemapTiledJSONUrl: string;
      startX: number;
      startY: number;
    }>;
  };
};
