import { ValidationSchema } from '../../validation/validation-schema.decorator';
import { DeleteLandParametersSchema } from './delete-land.schema';

@ValidationSchema(DeleteLandParametersSchema)
export class DeleteLandParametersDTO {
  landId!: string;
}
