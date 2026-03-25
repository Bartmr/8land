import { object } from 'not-me/lib/schemas/object/object-schema';
import { positiveInteger } from '../../internals/validation/schemas/positive-integer';
import { uuid } from '../../internals/validation/schemas/uuid.schema';

export const CreateTerritoryRequestJSONSchemaObj = {
  data: object({
    startX: positiveInteger().required(),
    startY: positiveInteger().required(),
    endX: positiveInteger().required(),
    endY: positiveInteger().required(),
  })
    .required()
    .test((v) =>
      v.endX > v.startX
        ? null
        : 'End X coordinate must be bigger than Start X coordinate',
    )
    .test((v) =>
      v.endY > v.startY
        ? null
        : 'End Y coordinate must be bigger than Start Y coordinate',
    ),
};

export const CreateTerritoryRequestJSONSchema = object({
  ...CreateTerritoryRequestJSONSchemaObj,
  landId: uuid().required(),
}).required();
