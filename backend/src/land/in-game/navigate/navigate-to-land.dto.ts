import { InGameLandDTO } from "../in-game.dto";

export class NavigateToLandQueryDTO {
  doorBlockId!: string;
  currentLandId!: string;
}

export class NavigateToLandDTO extends InGameLandDTO {}
