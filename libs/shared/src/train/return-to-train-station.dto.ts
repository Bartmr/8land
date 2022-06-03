import { ValidationSchema } from '../internals/validation/validation-schema.decorator';
import { NavigateToLandDTO } from '../land/in-game/navigate/navigate-to-land.dto';
import { ReturnToTrainStationQuerySchema } from './return-to-train-station.schemas';

@ValidationSchema(ReturnToTrainStationQuerySchema)
export class ReturnToTrainStationQueryDTO {
  boardedOnTrainStation?: string;
}

export class ReturnToTrainStationDTO extends NavigateToLandDTO {}
