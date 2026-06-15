import { z } from 'zod';
import { useMainApiFetchJSON } from '../../fetch-json';
import {
  CreateBlockRequestSchema,
  DynamicBlockType,
} from './create/create-block.schemas';

const DeleteBlockResponseSchema = z.object({
  status: z.literal(204),
  body: z.undefined().optional(),
});

const CreateBlockResponseSchema = z.union([
  z.object({
    status: z.literal(201),
    body: z.unknown(),
  }),
  z.object({
    status: z.literal(404),
    body: z
      .object({
        error: z
          .enum(['destination-land-not-found', 'land-not-found'])
          .optional(),
      })
      .optional(),
  }),
  z.object({
    status: z.literal(409),
    body: z
      .object({
        error: z.literal('block-limit-exceeded').optional(),
      })
      .optional(),
  }),
  z.object({
    status: z.literal(403),
    body: z
      .object({
        error: z.literal('land-is-outside-world').optional(),
      })
      .optional(),
  }),
]);

export class BlocksAPI {
  constructor(private api: ReturnType<typeof useMainApiFetchJSON>) {}

  deleteBlock(args: {
    blockType: DynamicBlockType.Door | DynamicBlockType.App;
    blockId: string;
  }) {
    return this.api.fetchJSON({
      schema: DeleteBlockResponseSchema,
      path: `/blocks/${args.blockType}/${args.blockId}`,
      method: 'DELETE',
    });
  }

  createBlock(args: z.infer<typeof CreateBlockRequestSchema>) {
    return this.api.fetchJSON({
      schema: CreateBlockResponseSchema,
      path: `/blocks`,
      method: 'POST',
      body: args,
    });
  }
}

export function useBlocksAPI() {
  const api = useMainApiFetchJSON();

  return new BlocksAPI(api);
}
