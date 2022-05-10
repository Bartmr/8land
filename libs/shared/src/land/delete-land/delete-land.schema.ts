import { object } from 'not-me/lib/schemas/object/object-schema';
import { Schema } from 'not-me/lib/schemas/schema';
import { uuid } from '../../internals/validation/schemas/uuid.schema';
import { DeleteLandParametersDTO } from './delete-land.dto';

export const DeleteLandParametersSchema: Schema<DeleteLandParametersDTO> =
  object({
    landId: uuid().required(),
  }).required();
