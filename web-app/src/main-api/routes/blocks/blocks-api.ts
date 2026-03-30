import {
  MainJSONApi,
  useMainJSONApi,
} from '../../use-main-json-api';
import { CreateBlockRequestDTO } from '@shared/src/blocks/create/create-block.dto';
import { DynamicBlockType } from '@shared/src/blocks/block.enums';

export class BlocksAPI {
  constructor(private api: MainJSONApi) {}

  deleteBlock(args: {
    blockType: DynamicBlockType.Door | DynamicBlockType.App;
    blockId: string;
  }) {
    return this.api.delete<{ status: 204; body: undefined }, undefined>({
      path: `/blocks/${args.blockType}/${args.blockId}`,
      query: undefined,
      acceptableStatusCodes: [204],
    });
  }

  createBlock(args: CreateBlockRequestDTO) {
    return this.api.post<
      | { status: 201; body: unknown }
      | {
          status: 404;
          body:
            | undefined
            | { error?: 'destination-land-not-found' | 'land-not-found' };
        }
      | { status: 409; body: undefined | { error?: 'block-limit-exceeded' } }
      | { status: 403; body: undefined | { error?: 'land-is-outside-world' } },
      undefined,
      CreateBlockRequestDTO
    >({
      path: `/blocks`,
      query: undefined,
      acceptableStatusCodes: [201, 404, 409],
      body: args,
    });
  }
}

export function useBlocksAPI() {
  const api = useMainJSONApi();

  return new BlocksAPI(api);
}
