import { z } from 'zod';

export const CreateLandRequestSchemaObj = {
  name: z
    .string()
    .transform((s) => s.trim())
    .refine((n) => n.length >= 1, 'Land name must have at least 1 character')
    .refine((n) => n.length <= 64, 'Land name cannot be more than 64 characters'),
};

export const CreateLandRequestSchema = z.object(
  CreateLandRequestSchemaObj,
);
