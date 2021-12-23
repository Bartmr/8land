import { ApiExtraModels, ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { ValidationSchema } from '../../../internals/validation/validation-schema.decorator';
import { BlockType } from './create-block.enums';
import {
  CreateBlockParametersSchema,
  CreateBlockRequestSchema,
} from './create-block.schemas';

class CreateDoorBlockDTO {
  landId!: string;
  type!: BlockType.Door;
  toLandId!: string;
}

@ValidationSchema(CreateBlockParametersSchema)
export class CreateBlockParametersDTO {
  landId!: string;
}

@ApiExtraModels(CreateDoorBlockDTO)
@ValidationSchema(CreateBlockRequestSchema)
export class CreateBlockRequestDTO {
  @ApiProperty({
    oneOf: [{ $ref: getSchemaPath(CreateDoorBlockDTO) }],
  })
  data!: CreateDoorBlockDTO;
}

class DoorBlockLandDTO {
  id!: string;
  name!: string;
  searchableName!: string;
}
class DoorBlockDTO {
  id!: string;
  toLand!: DoorBlockLandDTO;
}

export class BlockEntryDTO {
  door?: DoorBlockDTO;
}
