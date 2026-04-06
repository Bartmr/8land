import { z } from 'zod';
import { BoardTrainParametersDTO } from './board-train.dto';

export const BoardTrainParametersSchema: z.ZodType<BoardTrainParametersDTO> =
  z.object({
    worldId: z.uuid(),
  });
