import { object } from 'not-me/lib/schemas/object/object-schema';
import { Schema } from 'not-me/lib/schemas/schema';
import { uuid } from '../../internals/validation/schemas/uuid.schema';
import { BoardTrainParametersDTO } from './board-train.dto';

export const BoardTrainParametersSchema: Schema<BoardTrainParametersDTO> =
  object({
    worldId: uuid().required(),
  }).required();
