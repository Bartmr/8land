import { ApiExtraModels, ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { ValidationSchema } from '../../internals/validation/validation-schema.decorator';
import { DynamicBlockType } from './create-block.enums';
import { CreateBlockRequestSchema } from './create-block.schemas';

export class CreateDoorBlockDTO {
  type!: DynamicBlockType.Door;
  destinationLandName!: string;
}

export class AppBlockDTO {
  type!: DynamicBlockType.App;
  url!: string;
}

export class OtherBlockDTO {
  type!: DynamicBlockType.Other;
}

@ApiExtraModels(CreateDoorBlockDTO, AppBlockDTO, OtherBlockDTO)
@ValidationSchema(CreateBlockRequestSchema)
export class CreateBlockRequestDTO {
  landId!: string;
  @ApiProperty({
    oneOf: [
      { $ref: getSchemaPath(CreateDoorBlockDTO) },
      { $ref: getSchemaPath(AppBlockDTO) },
      { $ref: getSchemaPath(OtherBlockDTO) },
    ],
  })
  data!: CreateDoorBlockDTO | AppBlockDTO | OtherBlockDTO;
}
