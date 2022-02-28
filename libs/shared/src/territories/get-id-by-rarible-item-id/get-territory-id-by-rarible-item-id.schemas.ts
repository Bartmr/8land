import { object } from 'not-me/lib/schemas/object/object-schema';
import { Schema } from 'not-me/lib/schemas/schema';
import { string } from 'not-me/lib/schemas/string/string-schema';
import { GetTerritoryIdByRaribleItemIdParamsDTO } from './get-territory-id-by-rarible-item-id.dto';

export const GetTerritoryIdByRaribleItemIdParametersSchema: Schema<GetTerritoryIdByRaribleItemIdParamsDTO> =
  object({
    itemId: string().filled(),
  }).required();
