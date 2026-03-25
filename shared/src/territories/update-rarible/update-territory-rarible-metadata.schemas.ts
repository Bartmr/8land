import { z } from 'zod';
import { uuid } from '../../validation/schemas/uuid.schema';
import {
  UpdateTerritoryRaribleMetadataParametersDTO,
  UpdateTerritoryRaribleMetadataRequestDTO,
} from './update-territory-rarible-metadata.dto';

export const UpdateTerritoryRaribleMetadataParametersSchema: z.ZodType<UpdateTerritoryRaribleMetadataParametersDTO> =
  z.object({
    id: uuid(),
  });

export const UpdateTerritoryRaribleMetadataRequestSchema: z.ZodType<UpdateTerritoryRaribleMetadataRequestDTO> =
  z.object({
    tokenId: z.string(),
    tokenAddress: z.string(),
  });
