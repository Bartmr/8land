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

export class GetLandDTO {
  id!: string;
  name!: string;
  backgroundMusicUrl!: string | null;
  mapUrl?: string;
  tilesetUrl?: string;
  doorBlocksReferencing!: GetLandDoorReferencingDTO[];
  doorBlocks!: GetLandDoorBlockEntryDTO[];
}

@ValidationSchema(GetLandParametersSchema)
export class GetLandParametersDTO {
  id!: string;
}
