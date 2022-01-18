import { equals } from 'not-me/lib/schemas/equals/equals-schema';
import { object } from 'not-me/lib/schemas/object/object-schema';
import { Schema } from 'not-me/lib/schemas/schema';
import { string } from 'not-me/lib/schemas/string/string-schema';
import { uuid } from '../../internals/validation/schemas/uuid.schema';
import { CreateBlockRequestDTO } from './create-block.dto';
import { BlockType } from './create-block.enums';

export const CreateBlockRequestSchema: Schema<CreateBlockRequestDTO> = object({
  landId: uuid().required(),
  data: object({
    type: equals([BlockType.Door]).required(),
  })
    .required()
    .union<
      (o: { type: BlockType }) => {
        type: Schema<BlockType.Door>;
        destinationLandName: Schema<string>;
      }
    >((o) => {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (o.type === BlockType.Door) {
        return {
          type: equals([BlockType.Door] as const).required(),
          destinationLandName: string().filled(),
        } as const;
      } else {
        throw new Error();
      }
    }),
}).required();
