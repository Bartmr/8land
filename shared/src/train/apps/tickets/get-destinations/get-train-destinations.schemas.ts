import { z } from 'zod';
import { GetTrainDestinationQueryDTO } from './get-train-destinations.dto';

export const GetTrainDestinationQuerySchema: z.ZodType<GetTrainDestinationQueryDTO> =
  z.object({
    skip: z.number().int('Must be an integer').min(0, 'Must be a positive number'),
    name: z.string().optional().transform((s) => s || undefined),
  });
