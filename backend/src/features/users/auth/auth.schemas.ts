import { z } from 'zod';
import { LoginRequestDTO, SignupRequestDTO } from './auth.dtos';

export const loginRequestSchema: z.ZodType<LoginRequestDTO> = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const signupRequestSchema: z.ZodType<SignupRequestDTO> = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
