import { equals } from 'not-me/lib/schemas/equals/equals-schema';
import { object } from 'not-me/lib/schemas/object/object-schema';
import { Schema } from 'not-me/lib/schemas/schema';
import { getEnumValues } from '../../../internals/utils/enums/get-enum-values';
import { uuid } from '../../../internals/validation/schemas/uuid.schema';
import {
  CreateBlockParametersDTO,
  CreateBlockRequestDTO,
} from './create-block.dto';
import { BlockType } from './create-block.enums';

export const CreateBlockRequestSchema: Schema<CreateBlockRequestDTO> = object({
  data: object({
    landId: uuid().required(),
    type: equals(getEnumValues(BlockType)).required(),
  })
    .required()
    .union<
      (o: { type: BlockType }) => {
        type: Schema<BlockType.Door>;
        toLandId: Schema<string>;
      }
    >((o) => {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (o.type === BlockType.Door) {
        return {
          type: equals([BlockType.Door] as const).required(),
          toLandId: uuid().required(),
        } as const;
      } else {
        throw new Error();
      }
    }),
}).required();

export const CreateBlockParametersSchema: Schema<CreateBlockParametersDTO> =
  object({
    landId: uuid().required(),
  }).required();
