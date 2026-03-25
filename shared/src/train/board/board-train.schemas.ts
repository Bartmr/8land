import { z } from 'zod';
import { uuid } from '../../validation/schemas/uuid.schema';
import { BoardTrainParametersDTO } from './board-train.dto';

export const BoardTrainParametersSchema: z.ZodType<BoardTrainParametersDTO> =
  z.object({
    worldId: uuid(),
  });
