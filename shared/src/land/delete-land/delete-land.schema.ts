import { z } from 'zod';
import { uuid } from '../../validation/schemas/uuid.schema';
import { DeleteLandParametersDTO } from './delete-land.dto';

export const DeleteLandParametersSchema: z.ZodType<DeleteLandParametersDTO> =
  z.object({
    landId: uuid(),
  });
