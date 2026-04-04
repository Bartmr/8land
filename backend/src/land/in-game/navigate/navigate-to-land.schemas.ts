import { z } from 'zod';

export const NavigateToLandQuerySchema = z.object({
  doorBlockId: z.uuid(),
  currentLandId: z.uuid(),
});
