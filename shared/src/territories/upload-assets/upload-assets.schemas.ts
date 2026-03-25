import { object } from 'not-me/lib/schemas/object/object-schema';
import { Schema } from 'not-me/lib/schemas/schema';
import { uuid } from '../../internals/validation/schemas/uuid.schema';
import { UploadTerritoryAssetsParametersDTO } from './upload-assets.dto';

export const UploadTerritoryAssetsParametersSchema: Schema<UploadTerritoryAssetsParametersDTO> =
  object({
    id: uuid().required(),
  }).required();
