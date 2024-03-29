import { GetLandDTO } from '../../get/get-land.dto';

class LastDoorDTO {
  id!: string;
  toLandId!: string;
}

class LastTrainTravelDTO {
  comingBackToStation!: boolean;
}

export class ResumeLandNavigationDTO extends GetLandDTO {
  lastDoor!: null | LastDoorDTO;
  lastTrainTravel!: null | LastTrainTravelDTO;
  lastCheckpointWasDeleted!: boolean;
}
