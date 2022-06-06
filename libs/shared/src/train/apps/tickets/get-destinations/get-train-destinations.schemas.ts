import { number } from 'not-me/lib/schemas/number/number-schema';
import { object } from 'not-me/lib/schemas/object/object-schema';
import { Schema } from 'not-me/lib/schemas/schema';
import { string } from 'not-me/lib/schemas/string/string-schema';
import { GetTrainDestinationQueryDTO } from './get-train-destinations.dto';

export const GetTrainDestinationQuerySchema: Schema<GetTrainDestinationQueryDTO> =
  object({
    skip: number().integer().required(),
    name: string().transform((s) => (s ? s : undefined)),
  }).required();
