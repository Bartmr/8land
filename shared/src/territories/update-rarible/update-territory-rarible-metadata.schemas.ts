import { z } from 'zod';
import {
  UpdateTerritoryRaribleMetadataParametersDTO,
  UpdateTerritoryRaribleMetadataRequestDTO,
} from './update-territory-rarible-metadata.dto';

export const UpdateTerritoryRaribleMetadataParametersSchema: z.ZodType<UpdateTerritoryRaribleMetadataParametersDTO> =
  z.object({
    id: z.uuid(),
  });

export const UpdateTerritoryRaribleMetadataRequestSchema: z.ZodType<UpdateTerritoryRaribleMetadataRequestDTO> =
  z.object({
    tokenId: z.string(),
    tokenAddress: z.string(),
  });
