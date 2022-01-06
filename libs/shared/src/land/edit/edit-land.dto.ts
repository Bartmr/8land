import { ValidationSchema } from '../../internals/validation/validation-schema.decorator';
import {
  CreateLandRequestDTO,
  CreateLandResponseDTO,
} from '../create/create-land.dto';
import {
  EditLandBodySchema,
  EditLandParametersSchema,
} from './edit-land.schema';

@ValidationSchema(EditLandParametersSchema)
export class EditLandParametersDTO {
  landId!: string;
}

@ValidationSchema(EditLandBodySchema)
export class EditLandBodyDTO extends CreateLandRequestDTO {
  backgroundMusicUrl?: string | null;
}

export class EditLandDTO extends CreateLandResponseDTO {}
