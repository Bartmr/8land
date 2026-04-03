import { DynamicBlockType } from './create/create-block.schemas';

class CreateDoorBlockDTO {
  type!: DynamicBlockType.Door;
  destinationLandName!: string;
}

class AppBlockDTO {
  type!: DynamicBlockType.App;
  url!: string;
}

class OtherBlockDTO {
  type!: DynamicBlockType.Other;
}

export class CreateBlockRequestDTO {
  landId!: string;
  data!: CreateDoorBlockDTO | AppBlockDTO | OtherBlockDTO;
}
