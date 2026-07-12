import { GetLandDTO } from '../../../../../core/api/routes/lands/lands-api';

export function getLandSceneKey(land: GetLandDTO) {
  return `land-scene:${land.id}:scene`;
}

export function getLandSceneTilesetKey(land: GetLandDTO) {
  return `land-scene:${land.id}:tileset`;
}

export function getLandSceneTiledJSONKey(land: GetLandDTO) {
  return `land-scene:${land.id}:tiled-json`;
}