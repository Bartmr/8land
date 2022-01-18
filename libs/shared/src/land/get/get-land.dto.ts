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

class GetLandTerritoryDTO {
  id!: string;
  startX!: number;
  startY!: number;
  doorBlocks!: GetLandDoorBlockEntryDTO[];
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
  doorBlocksReferencing!: GetLandDoorReferencingDTO[];
  doorBlocks!: GetLandDoorBlockEntryDTO[];
  territories!: GetLandTerritoryDTO[];

  assets: undefined | GetLandAssetsDTO;
}

@ValidationSchema(GetLandParametersSchema)
export class GetLandParametersDTO {
  id!: string;
}
