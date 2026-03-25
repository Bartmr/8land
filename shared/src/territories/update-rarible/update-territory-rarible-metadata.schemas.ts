import { object } from 'not-me/lib/schemas/object/object-schema';
import { Schema } from 'not-me/lib/schemas/schema';
import { string } from 'not-me/lib/schemas/string/string-schema';
import { uuid } from '../../internals/validation/schemas/uuid.schema';
import {
  UpdateTerritoryRaribleMetadataParametersDTO,
  UpdateTerritoryRaribleMetadataRequestDTO,
} from './update-territory-rarible-metadata.dto';

export const UpdateTerritoryRaribleMetadataParametersSchema: Schema<UpdateTerritoryRaribleMetadataParametersDTO> =
  object({
    id: uuid().required(),
  }).required();

export const UpdateTerritoryRaribleMetadataRequestSchema: Schema<UpdateTerritoryRaribleMetadataRequestDTO> =
  object({
    tokenId: string().required(),
    tokenAddress: string().required(),
  }).required();
