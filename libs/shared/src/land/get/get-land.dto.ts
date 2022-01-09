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
  assetsUrlPrefix!: string | undefined;
}

export class GetLandDTO {
  id!: string;
  name!: string;
  backgroundMusicUrl!: string | null;
  doorBlocksReferencing!: GetLandDoorReferencingDTO[];
  doorBlocks!: GetLandDoorBlockEntryDTO[];
  territories!: GetLandTerritoryDTO[];
  assetsUrlPrefix: undefined | string;
}

@ValidationSchema(GetLandParametersSchema)
export class GetLandParametersDTO {
  id!: string;
}
