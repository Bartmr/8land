import { ValidationSchema } from '../../internals/validation/validation-schema.decorator';
import { CreateLandRequestSchema } from './create-land.schemas';

@ValidationSchema(CreateLandRequestSchema)
export class CreateLandRequestDTO {
  name!: string;
}

export class CreateLandResponseDTO {
  id!: string;
  name!: string;
}
