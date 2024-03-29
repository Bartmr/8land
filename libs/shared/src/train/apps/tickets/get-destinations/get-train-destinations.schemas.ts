import { object } from 'not-me/lib/schemas/object/object-schema';
import { Schema } from 'not-me/lib/schemas/schema';
import { string } from 'not-me/lib/schemas/string/string-schema';
import { positiveInteger } from '../../../../internals/validation/schemas/positive-integer';
import { GetTrainDestinationQueryDTO } from './get-train-destinations.dto';

export const GetTrainDestinationQuerySchema: Schema<GetTrainDestinationQueryDTO> =
  object({
    skip: positiveInteger().required(),
    name: string().transform((s) => (s ? s : undefined)),
  }).required();
