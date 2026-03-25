import { ValidationSchema } from '../../internals/validation/validation-schema.decorator';
import { IndexLandsQuerySchema } from './index-lands.schemas';

class LandFromIndex {
  id!: string;
  name!: string;
  published!: boolean;
  isStartingLand!: boolean;
}

export class IndexLandsDTO {
  total!: number;
  limit!: number;
  lands!: LandFromIndex[];
}

@ValidationSchema(IndexLandsQuerySchema)
export class IndexLandsQueryDTO {
  skip!: number;
}
