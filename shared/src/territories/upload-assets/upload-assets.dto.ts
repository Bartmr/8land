import { ApiProperty } from '@nestjs/swagger';
import { ValidationSchema } from '../../internals/validation/validation-schema.decorator';
import { UploadTerritoryAssetsParametersSchema } from './upload-assets.schemas';

@ValidationSchema(UploadTerritoryAssetsParametersSchema)
export class UploadTerritoryAssetsParametersDTO {
  id!: string;
}

export class UploadTerritoryAssetsRequestDTO {
  @ApiProperty({ type: 'string', format: 'binary' })
  map!: unknown;
  @ApiProperty({ type: 'string', format: 'binary' })
  tileset!: unknown;
}
