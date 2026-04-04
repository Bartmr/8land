import { z } from 'zod';

const positiveInt = z.number().int('Must be an integer').min(0, 'Must be a positive number');

export const CreateTerritoryRequestJSONSchemaObj = {
  data: z
    .object({
      startX: positiveInt,
      startY: positiveInt,
      endX: positiveInt,
      endY: positiveInt,
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
  landId: z.uuid(),
});
