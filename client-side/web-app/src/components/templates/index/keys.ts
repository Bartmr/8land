import { LandSceneArguments } from './land-scene.types';

export function getLandSceneKey(land: LandSceneArguments['land']) {
  return `land-scene:${land.id}:scene`;
}

export function getLandSceneTilesetKey(land: LandSceneArguments['land']) {
  return `land-scene:${land.id}:tileset`;
}

export function getLandSceneTiledJSONKey(land: LandSceneArguments['land']) {
  return `land-scene:${land.id}:tiled-json`;
}

export function getTerritoryTilesetKey(
  territory: LandSceneArguments['land']['territories'][number],
) {
  return `land-scene:territory:${territory.id}:tileset`;
}

export function getTerritoryTiledJSONKey(
  territory: LandSceneArguments['land']['territories'][number],
) {
  return `land-scene:territory:${territory.id}:tiled-json`;
}
