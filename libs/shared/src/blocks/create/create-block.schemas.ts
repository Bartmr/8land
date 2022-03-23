import { equals } from 'not-me/lib/schemas/equals/equals-schema';
import { object } from 'not-me/lib/schemas/object/object-schema';
import { Schema } from 'not-me/lib/schemas/schema';
import { string } from 'not-me/lib/schemas/string/string-schema';
import { uuid } from '../../internals/validation/schemas/uuid.schema';
import { CreateBlockRequestDTO } from './create-block.dto';
import { BlockType } from './create-block.enums';
import isURL from 'validator/lib/isURL';

export const CreateBlockRequestSchema: Schema<CreateBlockRequestDTO> = object({
  landId: uuid().required(),
  data: object({
    type: equals([
      BlockType.Door,
      BlockType.App,
      BlockType.Other,
    ] as const).required(),
  })
    .required()
    .union((o) => {
      if (o.type === BlockType.Door) {
        return {
          type: equals([BlockType.Door] as const).required(),
          destinationLandName: string().filled(),
        };
      } else if (o.type === BlockType.App) {
        return {
          type: equals([BlockType.App] as const).required(),
          url: string()
            .filled()
            .test((s) => (isURL(s) ? 'This is not a valid URL' : null)),
        };
      } else {
        return {
          type: equals([BlockType.Other] as const).required(),
        };
      }
    })
    .test((o) =>
      o.type === BlockType.Other ? 'Unsupported block type' : null,
    ),
}).required();
