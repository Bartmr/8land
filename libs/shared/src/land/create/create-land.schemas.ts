import { object } from 'not-me/lib/schemas/object/object-schema';
import { Schema } from 'not-me/lib/schemas/schema';
import { string } from 'not-me/lib/schemas/string/string-schema';
import { CreateLandRequestDTO } from './create-land.dto';

export const CreateLandRequestSchema: Schema<CreateLandRequestDTO> = object({
  name: string()
    .filled()
    .test((n) =>
      n.length > 64 ? 'Land name cannot be more than 64 characters' : null,
    ),
}).required();
