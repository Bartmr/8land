import { NavigateToLandDTO } from 'src/land/land.dtos';

export class BoardTrainParametersDTO {
  worldId!: string;
}

export class BoardTrainDTO extends NavigateToLandDTO {}

export class GetTrainDestinationQueryDTO {
  skip!: number;
  name?: string;
}

export class TrainDestinationDTO {
  name!: string;
  worldId!: string;
}

export class GetTrainDestinationsDTO {
  limit!: number;
  total!: number;
  rows!: TrainDestinationDTO[];
}

export class ReturnToTrainStationQueryDTO {
  boardedOnTrainStation?: string;
}

export class ReturnToTrainStationDTO extends NavigateToLandDTO {}
