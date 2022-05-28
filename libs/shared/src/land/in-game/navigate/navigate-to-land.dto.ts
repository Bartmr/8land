import { ValidationSchema } from '../../../internals/validation/validation-schema.decorator';
import { GetLandDTO } from '../../get/get-land.dto';
import { NavigateToLandQuerySchema } from './navigate-to-land.schemas';

@ValidationSchema(NavigateToLandQuerySchema)
export class NavigateToLandQueryDTO {
  doorBlockId!: string;
  currentLandId!: string;
}

export class NavigateToLandDTO extends GetLandDTO {}
