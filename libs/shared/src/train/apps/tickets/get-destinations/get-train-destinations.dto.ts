import { ValidationSchema } from '../../../../internals/validation/validation-schema.decorator';
import { GetTrainDestinationQuerySchema } from './get-train-destinations.schemas';

@ValidationSchema(GetTrainDestinationQuerySchema)
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
