import {
  MainJSONApi,
  useMainJSONApi,
} from '../app-internals/apis/main/use-main-json-api';
import { ToIndexedType } from '@app/shared/internals/transports/dto-types';
import { JSONData } from '../app-internals/transports/json-types';
import { CreateBlockRequestDTO } from '@app/shared/blocks/create/create-block.dto';

export class BlocksAPI {
  constructor(private api: MainJSONApi) {}

  deleteBlock(args: { blockId: string }) {
    return this.api.delete<{ status: 204; body: undefined }, undefined>({
      path: `/blocks/doors/${args.blockId}`,
      query: undefined,
      acceptableStatusCodes: [204],
    });
  }

  createBlock(args: CreateBlockRequestDTO) {
    return this.api.post<
      | { status: 201; body: JSONData }
      | { status: 404 | 409; body: undefined | { error: string } },
      undefined,
      ToIndexedType<CreateBlockRequestDTO>
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
