import { BlockType, DoorBlock, Land } from './land-scene.types';

export const START_BLOCK: DoorBlock = {
  type: BlockType.Door,
  id: '1',
  land_a: '1',
  land_b: '1',
};

export const BLOCK_2: DoorBlock = {
  type: BlockType.Door,
  id: '2',
  land_a: '1',
  land_b: '2',
};

export const LAND_1: Land = {
  id: '1',
  backgroundMusicUrl: 'https://api.soundcloud.com/tracks/256813580',
  isBaseLand: true,
  tilesetUrl: 'land-scene-tileset.png',
  tilemapTiledJSONUrl: 'land-scene-map.json',
  territories: [
    {
      id: '1',
      tilesetUrl: 'territory-tileset.png',
      tilemapTiledJSONUrl: 'territory-map.json',
      startX: 5,
      startY: 6,
      blocks: [BLOCK_2],
    },
  ],
  blocks: [START_BLOCK, BLOCK_2],
};

export const LAND_2: Land = {
  id: '2',
  backgroundMusicUrl: null,
  isBaseLand: false,
  tilesetUrl: 'land-scene-2-tileset.png',
  tilemapTiledJSONUrl: 'land-scene-2-map.json',
  territories: [],
  blocks: [BLOCK_2],
};

export function getLandById(id: string) {
  const allLands: { [key: string]: Land } = {
    '1': LAND_1,
    '2': LAND_2,
  };

  return allLands[id];
}
