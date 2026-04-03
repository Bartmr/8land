import { NavigateToLandDTO } from '../lands/lands.dtos';

export class GetTrainDestinationQueryDTO {
  skip!: number;
  name?: string;
}

class TrainDestinationDTO {
  name!: string;
  worldId!: string;
}

export class GetTrainDestinationsDTO {
  limit!: number;
  total!: number;
  rows!: TrainDestinationDTO[];
}

export class BoardTrainDTO extends NavigateToLandDTO {}

export class ReturnToTrainStationDTO extends NavigateToLandDTO {}
