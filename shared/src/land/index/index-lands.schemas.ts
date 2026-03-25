import { number } from 'not-me/lib/schemas/number/number-schema';
import { object } from 'not-me/lib/schemas/object/object-schema';
import { Schema } from 'not-me/lib/schemas/schema';
import { IndexLandsQueryDTO } from './index-lands.dto';

export const IndexLandsQuerySchema: Schema<IndexLandsQueryDTO> = object({
  skip: number()
    .required()
    .test((n) => (Number.isInteger(n) ? null : 'Must be an integer')),
}).required();
