import { object } from 'not-me/lib/schemas/object/object-schema';
import { uuid } from '../../internals/validation/schemas/uuid.schema';

export const GetLandParametersSchema = object({
  id: uuid().required(),
}).required();
