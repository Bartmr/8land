import { ValidationSchema } from '../internals/validation/validation-schema.decorator';
import { NavigateToLandDTO } from '../land/in-game/navigate/navigate-to-land.dto';
import { BoardTrainParametersSchema } from './board-train.schemas';

@ValidationSchema(BoardTrainParametersSchema)
export class BoardTrainParametersDTO {
  worldId!: string;
}

export class BoardTrainDTO extends NavigateToLandDTO {}
