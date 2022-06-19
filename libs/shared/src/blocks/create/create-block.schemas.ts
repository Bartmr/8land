import { equals } from 'not-me/lib/schemas/equals/equals-schema';
import { object } from 'not-me/lib/schemas/object/object-schema';
import { Schema } from 'not-me/lib/schemas/schema';
import { string } from 'not-me/lib/schemas/string/string-schema';
import { uuid } from '../../internals/validation/schemas/uuid.schema';
import { CreateBlockRequestDTO } from './create-block.dto';
import { DynamicBlockType } from './create-block.enums';
import isURL from 'validator/lib/isURL';

export const CreateBlockRequestSchema: Schema<CreateBlockRequestDTO> = object({
  landId: uuid().required(),
  data: object({
    type: equals([
      DynamicBlockType.Door,
      DynamicBlockType.App,
      DynamicBlockType.Other,
    ] as const).required(),
  })
    .required()
    .union((o) => {
      if (o.type === DynamicBlockType.Door) {
        return {
          type: equals([DynamicBlockType.Door] as const).required(),
          destinationLandName: string()
            .required()
            .transform((s) => s.trim())
            .test((s) => (s.length > 0 ? null : 'Must be filled')),
        };
      } else if (o.type === DynamicBlockType.App) {
        return {
          type: equals([DynamicBlockType.App] as const).required(),
          url: string()
            .required()
            .transform((s) => s.trim())
            .test((s) => (s.length > 0 ? null : 'Must be filled'))
            .test((s) => (isURL(s) ? null : 'This is not a valid URL')),
        };
      } else {
        return {
          type: equals([DynamicBlockType.Other] as const).required(),
        };
      }
    })
    .test((o) =>
      o.type === DynamicBlockType.Other ? 'Unsupported block type' : null,
    ),
}).required();
