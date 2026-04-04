import { z } from 'zod';

export const GetLandParametersSchema = z.object({
  id: z.uuid(),
});
