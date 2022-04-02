import { object } from 'not-me/lib/schemas/object/object-schema';
import { uuid } from '../../../internals/validation/schemas/uuid.schema';

export const NavigateToLandQuerySchema = object({
  doorBlockId: uuid().required(),
  currentLandId: uuid().required(),
}).required();
