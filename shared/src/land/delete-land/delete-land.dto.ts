import { ValidationSchema } from '../../internals/validation/validation-schema.decorator';
import { DeleteLandParametersSchema } from './delete-land.schema';

@ValidationSchema(DeleteLandParametersSchema)
export class DeleteLandParametersDTO {
  landId!: string;
}
