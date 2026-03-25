import { z } from 'zod';
import { GetTerritoryIdByRaribleItemIdParamsDTO } from './get-territory-id-by-rarible-item-id.dto';

export const GetTerritoryIdByRaribleItemIdParametersSchema: z.ZodType<GetTerritoryIdByRaribleItemIdParamsDTO> =
  z.object({
    itemId: z
      .string()
      .transform((s) => s.trim())
      .refine((s) => s.length > 0, 'Must be filled'),
  });
