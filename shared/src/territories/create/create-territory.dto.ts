import { JSONData } from '../../transports/json-types';

export class CreateTerritoryRequestDTO {
  data!: unknown;
  thumbnail!: unknown;
}

export class CreateTerritoryResponseDTO {
  territoryId!: string;
  nftMetadata!: JSONData;
}
