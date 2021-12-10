import { Land } from './land-scene.types';

export function getLandSceneKey(land: Land) {
  return `land-scene:${land.id}:scene`;
}

export function getLandSceneTilesetKey(land: Land) {
  return `land-scene:${land.id}:tileset`;
}

export function getLandSceneTiledJSONKey(land: Land) {
  return `land-scene:${land.id}:tiled-json`;
}

export function getTerritoryTilesetKey(territory: Land['territories'][number]) {
  return `land-scene:territory:${territory.id}:tileset`;
}

export function getTerritoryTiledJSONKey(
  territory: Land['territories'][number],
) {
  return `land-scene:territory:${territory.id}:tiled-json`;
}
