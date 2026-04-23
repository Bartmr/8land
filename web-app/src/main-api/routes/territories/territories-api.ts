import { z } from 'zod';
import { useMainApiFetchJSON } from '../../fetch-json';
import { GetTerritoryDTO, CreateTerritoryResponseDTO } from './territories.dtos';

type MainApiFetchJSON = ReturnType<typeof useMainApiFetchJSON>;

const jsonPrimitiveSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null(),
]);
type JSONPrimitive = z.infer<typeof jsonPrimitiveSchema>;
type JSONValue =
  | JSONPrimitive
  | { [key: string]: JSONValue | undefined }
  | JSONValue[];
type GetTerritoryResponse = { status: 200; body: GetTerritoryDTO };
type CreateTerritoryResponse =
  | {
      status: 201;
      body: CreateTerritoryResponseDTO;
    }
  | { status: 409; body: { error: string } };
type UploadAssetsBadRequestBody =
  | undefined
  | {
      error?:
        | 'train-and-start-block-not-allowed'
        | 'tileset-dimensions-dont-match';
    };
type UploadAssetsResponse =
  | { status: 204; body: undefined }
  | {
      status: 400;
      body: UploadAssetsBadRequestBody;
    };

const jsonValueSchema: z.ZodType<JSONValue> = z.lazy(() =>
  z.union([
    jsonPrimitiveSchema,
    z.array(jsonValueSchema),
    z.record(z.string(), jsonValueSchema.optional()),
  ]),
);
const territoryAssetsSchema = z.object({
  baseUrl: z.string(),
  mapKey: z.string(),
  tilesetKey: z.string(),
});

const uploadAssetsBadRequestBodySchema = z.object({
  error: z
    .union([
      z.literal('train-and-start-block-not-allowed'),
      z.literal('tileset-dimensions-dont-match'),
    ])
    .optional(),
});

const getTerritoryResponseSchema: z.ZodType<GetTerritoryResponse> = z.object({
  status: z.literal(200),
  body: z.object({
    id: z.string(),
    startX: z.number(),
    startY: z.number(),
    endX: z.number(),
    endY: z.number(),
    doorBlocks: z.array(
      z.object({
        id: z.string(),
        toLand: z.object({
          id: z.string(),
          name: z.string(),
        }),
      }),
    ),
    assets: z.custom<GetTerritoryDTO['assets']>(
      (value) =>
        value === undefined || territoryAssetsSchema.safeParse(value).success,
    ),
    inLand: z.object({
      name: z.string(),
    }),
    thumbnailUrl: z.string(),
  }) satisfies z.ZodType<GetTerritoryDTO>,
});

const createTerritoryResponseSchema: z.ZodType<CreateTerritoryResponse> =
  z.union([
    z.object({
      status: z.literal(201),
      body: z.object({
        territoryId: z.string(),
        nftMetadata: jsonValueSchema,
      }) satisfies z.ZodType<CreateTerritoryResponseDTO>,
    }),
    z.object({
      status: z.literal(409),
      body: z.object({
        error: z.string(),
      }),
    }),
  ]);

const uploadAssetsResponseSchema: z.ZodType<UploadAssetsResponse> = z.union([
  z.object({
    status: z.literal(204),
    body: z.undefined(),
  }),
  z.object({
    status: z.literal(400),
    body: z.custom<UploadAssetsBadRequestBody>(
      (value) =>
        value === undefined ||
        uploadAssetsBadRequestBodySchema.safeParse(value).success,
    ),
  }),
]);

export class TerritoriesAPI {
  constructor(private api: MainApiFetchJSON) {}

  getTerritory(args: { territoryId: string }) {
    return this.api.fetchJSON({
      schema: getTerritoryResponseSchema,
      path: `/territories/${args.territoryId}`,
      method: 'GET',
    });
  }

  createTerritory(data: FormData) {
    return this.api.fetchJSON({
      schema: createTerritoryResponseSchema,
      path: '/territories',
      method: 'POST',
      body: data,
    });
  }

  uploadAssets(args: { territoryId: string; formData: FormData }) {
    return this.api.fetchJSON({
      schema: uploadAssetsResponseSchema,
      path: `/territories/${args.territoryId}/assets`,
      method: 'PUT',
      body: args.formData,
    });
  }
}

export function useTerritoriesAPI() {
  const api = useMainApiFetchJSON();

  return new TerritoriesAPI(api);
}
