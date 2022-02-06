import { object } from 'not-me/lib/schemas/object/object-schema';
import { Schema } from 'not-me/lib/schemas/schema';
import { string } from 'not-me/lib/schemas/string/string-schema';
import { GetTerritoryParametersDTO } from './get-territory.dto';

export const GetTerritoryParametersSchema: Schema<GetTerritoryParametersDTO> =
  object({
    id: string().required(),
  }).required();
