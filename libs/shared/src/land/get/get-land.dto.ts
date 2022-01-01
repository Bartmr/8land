import { ValidationSchema } from '../../internals/validation/validation-schema.decorator';
import { GetLandParametersSchema } from './get-land-schemas';

class GetLandDoorBlockEntryDTO {
  id!: string;
  toLand!: string;
}

export class GetLandDTO {
  id!: string;
  name!: string;
  backgroundMusicUrl!: string | null;
  mapUrl?: string;
  tilesetUrl?: string;
  doorBlocksReferencing!: GetLandDoorBlockEntryDTO[];
  doorBlocks!: GetLandDoorBlockEntryDTO[];
}

@ValidationSchema(GetLandParametersSchema)
export class GetLandParametersDTO {
  id!: string;
}
