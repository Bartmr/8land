import { z } from 'zod';

export enum DynamicBlockType {
  Door = 'door',
  App = 'app',
  // NO-OP type
  Other = 'other',
}

export const CreateBlockRequestSchema = z.object({
  landId: z.uuid(),
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
          .url()
      }),
      z.object({
        type: z.literal(DynamicBlockType.Other),
      }),
    ])
    .refine((o) => o.type !== DynamicBlockType.Other, 'Unsupported block type'),
});
