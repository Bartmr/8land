import { z } from 'zod';
import { uuid } from '../../../validation/schemas/uuid.schema';

export const NavigateToLandQuerySchema = z.object({
  doorBlockId: uuid(),
  currentLandId: uuid(),
});
