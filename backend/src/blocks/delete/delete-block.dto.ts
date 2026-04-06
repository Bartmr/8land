import { DynamicBlockType } from '../block.enums';

export class DeleteBlockURLParameters {
  blockType!: DynamicBlockType.Door | DynamicBlockType.App;
  blockId!: string;
}
