import { z } from 'zod';
import { uuid } from '../../validation/schemas/uuid.schema';
import { DynamicBlockType } from '../block.enums';
import { DeleteBlockURLParameters } from './delete-block.dto';

export const DeleteBlockURLParamsSchema: z.ZodType<DeleteBlockURLParameters> =
  z.object({
    blockType: z.union([
      z.literal(DynamicBlockType.Door),
      z.literal(DynamicBlockType.App),
    ]),
    blockId: uuid(),
  });
