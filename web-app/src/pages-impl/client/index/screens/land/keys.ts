import { GetLandDTO } from '../../../../../main-api/routes/lands/lands.dtos';

export function getLandSceneKey(land: GetLandDTO) {
  return `land-scene:${land.id}:scene`;
}

export function getLandSceneTilesetKey(land: GetLandDTO) {
  return `land-scene:${land.id}:tileset`;
}

export function getLandSceneTiledJSONKey(land: GetLandDTO) {
  return `land-scene:${land.id}:tiled-json`;
}