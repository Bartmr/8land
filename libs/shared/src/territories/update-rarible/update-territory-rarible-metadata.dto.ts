import { ValidationSchema } from '../../internals/validation/validation-schema.decorator';
import {
  UpdateTerritoryRaribleMetadataParametersSchema,
  UpdateTerritoryRaribleMetadataRequestSchema,
} from './update-territory-rarible-metadata.schemas';

@ValidationSchema(UpdateTerritoryRaribleMetadataParametersSchema)
export class UpdateTerritoryRaribleMetadataParametersDTO {
  id!: string;
}

@ValidationSchema(UpdateTerritoryRaribleMetadataRequestSchema)
export class UpdateTerritoryRaribleMetadataRequestDTO {
  tokenId!: string;
  tokenAddress!: string;
}
