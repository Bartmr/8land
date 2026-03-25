import { ApiProperty } from '@nestjs/swagger';
import { JSONData } from '../../internals/transports/json-types';

export class CreateTerritoryRequestDTO {
  @ApiProperty({ type: 'string', format: 'binary' })
  data!: unknown;
  @ApiProperty({ type: 'string', format: 'binary' })
  thumbnail!: unknown;
}

export class CreateTerritoryResponseDTO {
  territoryId!: string;
  nftMetadata!: JSONData;
}
