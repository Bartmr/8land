import { ValidationSchema } from '../../internals/validation/validation-schema.decorator';
import { GetTerritoryIdByRaribleItemIdParametersSchema } from './get-territory-id-by-rarible-item-id.schemas';

@ValidationSchema(GetTerritoryIdByRaribleItemIdParametersSchema)
export class GetTerritoryIdByRaribleItemIdParamsDTO {
  itemId!: string;
}

export class GetTerritoryIdByRaribleItemIdDTO {
  id!: string;
  owned!: boolean;
}
