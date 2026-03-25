import { z } from 'zod';
import { uuid } from '../../validation/schemas/uuid.schema';
import { CreateBlockRequestDTO } from './create-block.dto';
import { DynamicBlockType } from './create-block.enums';
import isURL from 'validator/lib/isURL';

export const CreateBlockRequestSchema: z.ZodType<CreateBlockRequestDTO> = z.object({
  landId: uuid(),
  data: z
    .discriminatedUnion('type', [
      z.object({
        type: z.literal(DynamicBlockType.Door),
        destinationLandName: z
          .string()
          .transform((s) => s.trim())
          .refine((s) => s.length > 0, 'Must be filled'),
      }),
      z.object({
        type: z.literal(DynamicBlockType.App),
        url: z
          .string()
          .transform((s) => s.trim())
          .refine((s) => s.length > 0, 'Must be filled')
          .refine((s) => isURL(s), 'This is not a valid URL'),
      }),
      z.object({
        type: z.literal(DynamicBlockType.Other),
      }),
    ])
    .refine((o) => o.type !== DynamicBlockType.Other, 'Unsupported block type'),
});
