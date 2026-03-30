import { z } from 'zod';
import { DeleteLandParametersDTO } from './delete-land.dto';

export const DeleteLandParametersSchema: z.ZodType<DeleteLandParametersDTO> =
  z.object({
    landId: z.uuid(),
  });
