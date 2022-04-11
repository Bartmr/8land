import { GetLandDTO } from '../../get/get-land.dto';

class LastDoorDTO {
  id!: string;
  toLandId!: string;
}

export class ResumeLandNavigationDTO extends GetLandDTO {
  lastDoor!: null | LastDoorDTO;
  lastDoorWasDeleted!: boolean;
}
