import { ApiExtraModels, ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { DynamicBlockType } from './create-block.enums';

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
