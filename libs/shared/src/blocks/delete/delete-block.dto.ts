import { ValidationSchema } from '../../internals/validation/validation-schema.decorator';
import { DynamicBlockType } from '../block.enums';
import { DeleteBlockURLParamsSchema } from './delete-block.schema';

@ValidationSchema(DeleteBlockURLParamsSchema)
export class DeleteBlockURLParameters {
  blockType!: DynamicBlockType.Door | DynamicBlockType.App;
  blockId!: string;
}
