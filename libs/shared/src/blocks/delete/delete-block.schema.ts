import { object } from 'not-me/lib/schemas/object/object-schema';
import { uuid } from '../../internals/validation/schemas/uuid.schema';

export const DeleteBlockURLParamsSchema = object({
  blockId: uuid().required(),
}).required();
