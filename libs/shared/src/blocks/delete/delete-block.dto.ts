import { ValidationSchema } from '../../internals/validation/validation-schema.decorator';
import { DeleteBlockURLParamsSchema } from './delete-block.schema';

@ValidationSchema(DeleteBlockURLParamsSchema)
export class DeleteBlockURLParameters {
  blockId!: string;
}
