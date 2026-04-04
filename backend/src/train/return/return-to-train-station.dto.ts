import { NavigateToLandDTO } from '../../land/in-game/navigate/navigate-to-land.dto';

export class ReturnToTrainStationQueryDTO {
  boardedOnTrainStation?: string;
}

export class ReturnToTrainStationDTO extends NavigateToLandDTO {}
