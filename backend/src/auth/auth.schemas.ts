import { z } from 'zod';
import { LoginRequestDTO } from './auth.dto';

export const loginRequestSchema: z.ZodType<LoginRequestDTO> = z.object({
  firebaseIdToken: z.string(),
});
