import { ApiProperty } from '@nestjs/swagger';

export class CreateTerritoryRequestDTO {
  @ApiProperty({ type: 'string', format: 'binary' })
  data!: unknown;
  @ApiProperty({ type: 'string', format: 'binary' })
  thumbnail!: unknown;
}

export class CreateTerritoryResponseDTO {
  nftMetadataURL!: string;
}
