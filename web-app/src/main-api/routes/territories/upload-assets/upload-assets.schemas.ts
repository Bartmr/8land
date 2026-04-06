import { z } from 'zod';

export const TERRITORY_TILESET_SIZE_LIMIT = 128000;
export const TERRITORY_MAP_SIZE_LIMIT = 128000;

export const UploadTerritoryAssetsParametersSchema = z.object({
  id: z.uuid(),
});
