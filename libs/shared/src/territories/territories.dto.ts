import { ApiProperty } from '@nestjs/swagger';

export class CreateTerritoryRequest {
  @ApiProperty({ type: 'string', format: 'binary' })
  data!: unknown;
  @ApiProperty({ type: 'string', format: 'binary' })
  thumbnail!: unknown;
}
