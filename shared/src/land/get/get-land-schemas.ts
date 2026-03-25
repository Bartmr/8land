import { z } from 'zod';
import { uuid } from '../../validation/schemas/uuid.schema';

export const GetLandParametersSchema = z.object({
  id: uuid(),
});
