import { object } from 'not-me/lib/schemas/object/object-schema';
import { Schema } from 'not-me/lib/schemas/schema';
import { string } from 'not-me/lib/schemas/string/string-schema';
import { uuid } from '../../internals/validation/schemas/uuid.schema';
import { CreateLandRequestSchemaObj } from '../create/create-land.schemas';
import { EditLandBodyDTO, EditLandParametersDTO } from './edit-land.dto';

export const EditLandParametersSchema: Schema<EditLandParametersDTO> = object({
  landId: uuid().required(),
}).required();

export const EditLandBodySchema: Schema<EditLandBodyDTO> = object({
  ...CreateLandRequestSchemaObj,
  backgroundMusicUrl: string()
    .transform((s) => (s ? s.trim() : s))
    .transform((s) => (s ? s : undefined))
    .test((s) =>
      s == undefined || s.startsWith('https://soundcloud.com/')
        ? null
        : 'Must be a Soundcloud music link',
    ),
}).required();
