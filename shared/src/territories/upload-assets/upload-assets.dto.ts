import { ApiProperty } from '@nestjs/swagger';

export class UploadTerritoryAssetsParametersDTO {
  id!: string;
}

export class UploadTerritoryAssetsRequestDTO {
  @ApiProperty({ type: 'string', format: 'binary' })
  map!: unknown;
  @ApiProperty({ type: 'string', format: 'binary' })
  tileset!: unknown;
}
