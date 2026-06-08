import { NavigateToLandDTO } from '../navigate/navigate-to-land.dto';

class LastDoorDTO {
  id!: string;
  toLandId!: string;
}

class LastTrainTravelDTO {
  comingBackToStation!: boolean;
}

export class ResumeLandNavigationDTO extends NavigateToLandDTO {
  lastDoor!: null | LastDoorDTO;
  lastTrainTravel!: null | LastTrainTravelDTO;
  lastCheckpointWasDeleted!: boolean;
}
