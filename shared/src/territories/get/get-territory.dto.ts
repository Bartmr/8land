import { ValidationSchema } from '../../internals/validation/validation-schema.decorator';
import { GetTerritoryParametersSchema } from './get-territory.schemas';

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

@ValidationSchema(GetTerritoryParametersSchema)
export class GetTerritoryParametersDTO {
  id!: string;
}
