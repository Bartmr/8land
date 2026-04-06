type JSONPrimitive = string | number | boolean | null;
type JSONObject = { [x: string]: undefined | JSONPrimitive | JSONObject | JSONArray };
type JSONArray = Array<JSONPrimitive | JSONObject | JSONArray>;
type JSONData = JSONPrimitive | JSONObject | JSONArray;

class GetTerritoryInLandDTO {
  name!: string;
}

class GetTerritoryDoorBlockDestinationDTO {
  id!: string;
  name!: string;
}

class GetTerritoryDoorBlockEntryDTO {
  id!: string;
  toLand!: GetTerritoryDoorBlockDestinationDTO;
}

class GetTerritoryAssetsDTO {
  baseUrl!: string;
  mapKey!: string;
  tilesetKey!: string;
}

export class GetTerritoryDTO {
  id!: string;
  startX!: number;
  startY!: number;
  endX!: number;
  endY!: number;
  doorBlocks!: GetTerritoryDoorBlockEntryDTO[];
  assets: undefined | GetTerritoryAssetsDTO;
  inLand!: GetTerritoryInLandDTO;
  thumbnailUrl!: string;
}

export class CreateTerritoryResponseDTO {
  territoryId!: string;
  nftMetadata!: JSONData;
}
