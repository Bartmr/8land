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
