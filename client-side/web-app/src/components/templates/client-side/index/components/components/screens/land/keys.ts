import { GetLandDTO } from '@app/shared/land/get/get-land.dto';

export function getLandSceneKey(land: GetLandDTO) {
  return `land-scene:${land.id}:scene`;
}

export function getLandSceneTilesetKey(land: GetLandDTO) {
  return `land-scene:${land.id}:tileset`;
}

export function getLandSceneTiledJSONKey(land: GetLandDTO) {
  return `land-scene:${land.id}:tiled-json`;
}

export function getTerritoryTilesetKey(
  territory: GetLandDTO['territories'][number],
) {
  return `land-scene:territory:${territory.id}:tileset`;
}

export function getTerritoryTiledJSONKey(
  territory: GetLandDTO['territories'][number],
) {
  return `land-scene:territory:${territory.id}:tiled-json`;
}
