import { GetLandDTO } from "../get/get-land.dto";

export class NavigateToLandQueryDTO {
  doorBlockId!: string;
  currentLandId!: string;
}

export class NavigateToLandDTO extends GetLandDTO {

}
