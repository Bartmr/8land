import { z } from 'zod';
import { uuid } from '../../validation/schemas/uuid.schema';
import { UploadTerritoryAssetsParametersDTO } from './upload-assets.dto';

export const UploadTerritoryAssetsParametersSchema: z.ZodType<UploadTerritoryAssetsParametersDTO> =
  z.object({
    id: uuid(),
  });
