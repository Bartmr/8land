import { ApiExtraModels, ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { ValidationSchema } from '../../internals/validation/validation-schema.decorator';
import { BlockType } from './create-block.enums';
import { CreateBlockRequestSchema } from './create-block.schemas';

export class CreateDoorBlockDTO {
  type!: BlockType.Door;
  destinationLandName!: string;
}

export class AppBlockDTO {
  type!: BlockType.App;
  url!: string;
}

export class OtherBlockDTO {
  type!: BlockType.Other;
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
