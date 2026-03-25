import { ValidationSchema } from '../../internals/validation/validation-schema.decorator';
import { UploadLandAssetsParametersSchema } from './upload-land-assets.schemas';

@ValidationSchema(UploadLandAssetsParametersSchema)
export class UploadLandAssetsParameters {
  landId!: string;
}
