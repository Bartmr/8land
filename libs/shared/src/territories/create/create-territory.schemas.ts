import { number } from 'not-me/lib/schemas/number/number-schema';
import { object } from 'not-me/lib/schemas/object/object-schema';
import { uuid } from '../../internals/validation/schemas/uuid.schema';

export const CreateTerritoryRequestJSONSchemaObj = {
  data: object({
    startX: number()
      .required()
      .integer()
      .test((n) => (n >= 0 ? null : 'Must be a positive number')),
    startY: number()
      .required()
      .integer()
      .test((n) => (n >= 0 ? null : 'Must be a positive number')),
    endX: number()
      .required()
      .integer()
      .test((n) => (n >= 0 ? null : 'Must be a positive number')),
    endY: number()
      .required()
      .integer()
      .test((n) => (n >= 0 ? null : 'Must be a positive number')),
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
