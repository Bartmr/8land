import { ValidationSchema } from '../../internals/validation/validation-schema.decorator';
import { GetLandParametersSchema } from './get-land-schemas';

class GetLandDoorReferencingDTO {
  id!: string;
  fromLandId!: string;
  fromLandName!: string;
}

class GetLandDoorBlockDestinationDTO {
  id!: string;
  name!: string;
}

class GetLandDoorBlockEntryDTO {
  id!: string;
  toLand!: GetLandDoorBlockDestinationDTO;
}

class GetLandAppBlockEntryDTO {
  id!: string;
  url!: string;
}

class GetLandTerritoryDTO {
  id!: string;
  startX!: number;
  startY!: number;
  endX!: number;
  endY!: number;
  doorBlocks!: GetLandDoorBlockEntryDTO[];
  appBlocks!: GetLandAppBlockEntryDTO[];
  assets: undefined | GetLandAssetsDTO;
}

export class GetLandAssetsDTO {
  baseUrl!: string;
  mapKey!: string;
  tilesetKey!: string;
}

export class GetLandDTO {
  id!: string;
  name!: string;
  backgroundMusicUrl!: string | null;
  territories!: GetLandTerritoryDTO[];
  doorBlocks!: GetLandDoorBlockEntryDTO[];
  doorBlocksReferencing!: GetLandDoorReferencingDTO[];
  appBlocks!: GetLandAppBlockEntryDTO[];
  assets: undefined | GetLandAssetsDTO;
  isStartLand!: boolean;
}

@ValidationSchema(GetLandParametersSchema)
export class GetLandParametersDTO {
  id!: string;
}
