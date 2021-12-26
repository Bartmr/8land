import { object } from 'not-me/lib/schemas/object/object-schema';
import { Schema } from 'not-me/lib/schemas/schema';
import { string } from 'not-me/lib/schemas/string/string-schema';
import { CreateLandRequestDTO } from './create-land.dto';

export const CreateLandRequestSchemaObj = {
  name: string()
    .filled()
    .transform((s) => s.trim())
    .test((n) =>
      n.length < 1 ? 'Land name must have at least 1 character' : null,
    )
    .test((n) =>
      n.length > 64 ? 'Land name cannot be more than 64 characters' : null,
    ),
};

export const CreateLandRequestSchema: Schema<CreateLandRequestDTO> = object(
  CreateLandRequestSchemaObj,
).required();
