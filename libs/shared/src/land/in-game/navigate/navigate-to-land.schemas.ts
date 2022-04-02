import { ValidationSchema } from '../../../internals/validation/validation-schema.decorator';
import { NavigateToLandQuerySchema } from './navigate-to-land.dto';

@ValidationSchema(NavigateToLandQuerySchema)
export class NavigateToLandQueryDTO {
  doorBlockId!: string;
  currentLandId!: string;
}
