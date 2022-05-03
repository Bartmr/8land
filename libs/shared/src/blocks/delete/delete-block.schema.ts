import { equals } from 'not-me/lib/schemas/equals/equals-schema';
import { object } from 'not-me/lib/schemas/object/object-schema';
import { Schema } from 'not-me/lib/schemas/schema';
import { uuid } from '../../internals/validation/schemas/uuid.schema';
import { DynamicBlockType } from '../block.enums';
import { DeleteBlockURLParameters } from './delete-block.dto';

export const DeleteBlockURLParamsSchema: Schema<DeleteBlockURLParameters> =
  object({
    blockType: equals([
      DynamicBlockType.Door,
      DynamicBlockType.App,
    ] as const).required(),
    blockId: uuid().required(),
  }).required();
