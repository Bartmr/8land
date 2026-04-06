import { z } from 'zod';
import { UploadTerritoryAssetsParametersDTO } from './upload-assets.dto';

export const UploadTerritoryAssetsParametersSchema: z.ZodType<UploadTerritoryAssetsParametersDTO> =
  z.object({
    id: z.uuid(),
  });
