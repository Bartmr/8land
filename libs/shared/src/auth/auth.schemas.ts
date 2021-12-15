import { object } from 'not-me/lib/schemas/object/object-schema';
import { Schema } from 'not-me/lib/schemas/schema';
import { string } from 'not-me/lib/schemas/string/string-schema';
import { LoginRequestDTO } from './auth.dto';

export const loginRequestSchema: Schema<LoginRequestDTO> = object({
  firebaseIdToken: string().filled(),
}).required();
