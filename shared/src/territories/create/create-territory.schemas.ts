import { z } from 'zod';
import { positiveInteger } from '../../validation/schemas/positive-integer';
import { uuid } from '../../validation/schemas/uuid.schema';

export const CreateTerritoryRequestJSONSchemaObj = {
  data: z
    .object({
      startX: positiveInteger(),
      startY: positiveInteger(),
      endX: positiveInteger(),
      endY: positiveInteger(),
    })
    .refine(
      (v) => v.endX > v.startX,
      'End X coordinate must be bigger than Start X coordinate',
    )
    .refine(
      (v) => v.endY > v.startY,
      'End Y coordinate must be bigger than Start Y coordinate',
    ),
};

export const CreateTerritoryRequestJSONSchema = z.object({
  ...CreateTerritoryRequestJSONSchemaObj,
  landId: uuid(),
});
