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

export class CreateBlockRequestDTO {
  landId!: string;

  data!: CreateDoorBlockDTO | AppBlockDTO | OtherBlockDTO;
}
