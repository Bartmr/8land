import { z } from 'zod';
import { positiveInteger } from '../../../../validation/schemas/positive-integer';
import { GetTrainDestinationQueryDTO } from './get-train-destinations.dto';

export const GetTrainDestinationQuerySchema: z.ZodType<GetTrainDestinationQueryDTO> =
  z.object({
    skip: positiveInteger(),
    name: z.string().optional().transform((s) => s || undefined),
  });
