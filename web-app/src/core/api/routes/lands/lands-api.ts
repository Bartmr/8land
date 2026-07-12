import { z } from 'zod';
import {
  useApiFetchJSON,
} from '../../fetch-json';
import { Logger } from '../../../logging/logger';
import { CommunicationError } from '../../../communication-errors/communication-errors';

export const CreateLandRequestSchemaObj = {
  name: z
    .string()
    .transform((s) => s.trim())
    .refine((n) => n.length >= 1, 'Land name must have at least 1 character')
    .refine((n) => n.length <= 64, 'Land name cannot be more than 64 characters'),
};

export const CreateLandRequestSchema = z.object(CreateLandRequestSchemaObj);

export const LAND_TILESET_SIZE_LIMIT = 128000;
export enum StaticBlockType {
  Collides = 'collides',
  Text = 'text',
  TrainPlatform = 'train-platform',
  Start = 'start',
}

export const STATIC_BLOCK_TYPE_VALUES = [
  StaticBlockType.Collides,
  StaticBlockType.Text,
  StaticBlockType.TrainPlatform,
  StaticBlockType.Start,
];

export const UploadLandAssetsParametersSchema = z.object({
  landId: z.uuid(),
});

export const createTiledJSONSchema = ({
  maxWidth: _maxWidth,
  maxHeight: _maxHeight,
  maxWidthMessage,
  maxHeightMessage,
}: {
  maxWidth: number | null;
  maxHeight: number | null;
  maxWidthMessage?: string;
  maxHeightMessage?: string;
}) => {
  const maxWidth = _maxWidth ? _maxWidth + 1 : 41;
  const maxHeight = _maxHeight ? _maxHeight + 1 : 41;

  return z
    .looseObject({
      compressionlevel: z.literal(
        -1,
        'Must set to -1, which is the default value in Tiled',
      ),
      height: z
        .number()
        .int('Must be an integer')
        .refine(
          (h) => h > 0 && h < maxHeight,
          maxHeightMessage || `Must be greater than 0 and less than ${maxHeight}`,
        ),
      infinite: z
        .boolean()
        .refine((i) => !i, 'Map cannot be infinite'),
      layers: z
        .array(
          z.looseObject({
            data: z.array(z.number().int('Must be an integer').min(0, 'Must be a positive number')),
            height: z.number().int('Must be an integer').min(0, 'Must be a positive number'),
            id: z.number().int('Must be an integer').min(0, 'Must be a positive number'),
            name: z
              .string()
              .refine((s) => s.trim().length > 0, 'Layer must have a name'),
            opacity: z.literal(1, 'All layers must have full opacity'),
            type: z.literal('tilelayer', 'Only tile layers are allowed'),
            visible: z.literal(true, 'All layers must be visible').optional(),
            width: z.number().int('Must be an integer').min(0, 'Must be a positive number'),
            x: z.literal(0, 'Must be set to 0'),
            y: z.literal(0, 'Must be set to 0'),
          }),
        )
        .min(1, 'You must have at least one layer'),
      nextlayerid: z.number().int('Must be an integer').min(0, 'Must be a positive number'),
      nextobjectid: z.number().int('Must be an integer').min(0, 'Must be a positive number'),
      orientation: z.literal('orthogonal', "must be set to 'orthogonal'"),
      renderorder: z.literal('right-down', "must be set to 'right-down'"),
      tiledversion: z.string(),
      tileheight: z.literal(16, 'Must be set to 16'),
      tilesets: z
        .array(
          z.looseObject({
            columns: z.number().int('Must be an integer').min(0, 'Must be a positive number'),
            firstgid: z.number().int('Must be an integer').min(0, 'Must be a positive number'),
            image: z
              .string()
              .transform((s) => s.trim())
              .refine((s) => s.length > 0, 'Tileset must have an image'),
            imageheight: z.number().int('Must be an integer').min(0, 'Must be a positive number'),
            imagewidth: z.number().int('Must be an integer').min(0, 'Must be a positive number'),
            margin: z.literal(0, 'Must be set to 0'),
            name: z
              .string()
              .refine((s) => s.trim().length > 0, 'Tileset must have a name'),
            spacing: z.literal(0, 'Must be set to 0'),
            tilecount: z.number().int('Must be an integer').min(0, 'Must be a positive number'),
            tileheight: z.literal(16, 'Must be set to 16'),
            tilewidth: z.literal(16, 'Must be set to 16'),
            tiles: z.array(
              z.looseObject({
                id: z.number().int('Must be an integer').min(0, 'Must be a positive number'),
                properties: z
                  .array(
                    z.union([
                      z.object({
                        name: z.literal(
                          StaticBlockType.Collides,
                          'can be set as "collides"',
                        ),
                        type: z.literal(
                          'bool',
                          "'collides' props must be of boolean type",
                        ),
                        value: z.boolean(),
                      }),
                      z.object({
                        name: z.literal(
                          StaticBlockType.Text,
                          'can be set as "text"',
                        ),
                        type: z.literal(
                          'string',
                          "'text' props must be of string type",
                        ),
                        value: z
                          .string()
                          .nullish()
                          .transform((s) => s ?? '')
                          .refine(
                            (s) => s.length <= 255,
                            'Text cannot be longer than 255 characters',
                          ),
                      }),
                      z.object({
                        name: z.literal(
                          StaticBlockType.Start,
                          'can be set as "start"',
                        ),
                        type: z.literal(
                          'bool',
                          "'start' props must be of boolean type",
                        ),
                        value: z.literal(true, 'value must be true'),
                      }),
                      z.object({
                        name: z.literal(
                          StaticBlockType.TrainPlatform,
                          'can be set as "train-platform"',
                        ),
                        type: z.literal(
                          'bool',
                          "'train-platform' props must be of boolean type",
                        ),
                        value: z.literal(true, 'value must be true'),
                      }),
                      z.object({
                        name: z.string(),
                        type: z.literal('string', 'Block IDs must be of string type'),
                        value: z.string(),
                      }),
                    ]),
                  )
                  .optional(),
                animation: z
                  .array(
                    z.looseObject({
                      duration: z.number().int('Must be an integer').min(0, 'Must be a positive number'),
                      tileid: z.number().int('Must be an integer').min(0, 'Must be a positive number'),
                    }),
                  )
                  .optional(),
              }),
            ),
          }),
        )
        .min(1, 'You must have at least one tileset')
        .max(1, 'You cannot have more than one tileset'),
      tilewidth: z.literal(16, 'Must be set to 16'),
      type: z.literal('map', "Must be set to 'map'"),
      version: z
        .string()
        .refine((s) => s.trim().length > 0, 'A version must be specified'),
      width: z
        .number()
        .int('Must be an integer')
        .refine(
          (w) => w > 0 && w < maxWidth,
          maxWidthMessage || `Must be greater than 0 and less than ${maxWidth}`,
        ),
    })
    .superRefine((o, ctx) => {
      for (const layer of o.layers) {
        if (layer.height !== o.height) {
          ctx.addIssue({ code: 'custom', message: `Layer "${layer.name}" height must be equal to the map height` });
        }

        if (layer.width !== o.width) {
          ctx.addIssue({ code: 'custom', message: `Layer "${layer.name}" width must be equal to the map width` });
        }
      }

      for (const tileset of o.tilesets) {
        for (const tile of tileset.tiles) {
          if (tile.animation) {
            for (const animation of tile.animation) {
              if (animation.tileid > tileset.tilecount) {
                ctx.addIssue({ code: 'custom', message: `${animation.tileid} is bigger than the total tiles in the tileset` });
              }
            }
          }
        }
      }
    });
};

const landAssetsSchema = z.object({
  baseUrl: z.string(),
  mapKey: z.string(),
  tilesetKey: z.string(),
});

const landDoorBlockDestinationSchema = z.object({
  id: z.string(),
  name: z.string(),
});

const landDoorBlockEntrySchema = z.object({
  id: z.string(),
  toLand: landDoorBlockDestinationSchema,
});

const landDoorReferencingSchema = z.object({
  id: z.string(),
  fromLandId: z.string(),
  fromLandName: z.string(),
});

const landAppBlockEntrySchema = z.object({
  id: z.string(),
  url: z.string(),
});

const landSchema = z.object({
  id: z.string(),
  name: z.string(),
  backgroundMusicUrl: z.string().nullable(),
  doorBlocks: z.array(landDoorBlockEntrySchema),
  doorBlocksReferencing: z.array(landDoorReferencingSchema),
  appBlocks: z.array(landAppBlockEntrySchema),
  assets: z.union([z.undefined(), landAssetsSchema]),
  isStartLand: z.boolean(),
});

export type GetLandDTO = z.infer<typeof landSchema>;


const resumeLandSchema = landSchema.extend({
  lastDoor: z
    .object({
      id: z.string(),
      toLandId: z.string(),
    })
    .nullable(),
  lastTrainTravel: z
    .object({
      comingBackToStation: z.boolean(),
    })
    .nullable(),
  lastCheckpointWasDeleted: z.boolean(),
});

const navigateResponseSchema = z.object({
  status: z.literal(200),
  body: landSchema,
});

export type NavigateToLandDTO = GetLandDTO;

const resumeResponseSchema = z.object({
  status: z.literal(200),
  body: resumeLandSchema,
});

export type ResumeLandNavigationDTO = z.infer<typeof resumeLandSchema>;

const getEditableLandResponseSchema = z.object({
  status: z.literal(200),
  body: landSchema,
}) satisfies z.ZodType<{ status: 200; body: GetLandDTO }>;

const indexLandsResponseSchema = z.object({
  status: z.literal(200),
  body: z.object({
    total: z.number(),
    limit: z.number(),
    lands: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        published: z.boolean(),
        isStartingLand: z.boolean(),
      }),
    ),
  }),
});

export type IndexLandsDTO = z.infer<typeof indexLandsResponseSchema>['body'];


const createLandResponseSchema = z.union([
  z.object({
    status: z.literal(201),
  }),
  z.object({
    status: z.literal(409),
    body: z.union([
      z.object({ error: z.undefined() }),
      z.object({
        error: z.literal('lands-limit-exceeded'),
        limit: z.number(),
      }),
      z.object({
        error: z.union([
          z.literal('name-already-taken'),
          z.literal('cannot-create-more-lands-without-start-block'),
        ]),
      }),
    ]),
  }),
]) satisfies z.ZodType<
  | { status: 201 }
  | {
      status: 409;
      body:
        | { error?: undefined }
        | { error: 'lands-limit-exceeded'; limit: number }
        | {
            error:
              | 'name-already-taken'
              | 'cannot-create-more-lands-without-start-block';
          };
    }
>;

const uploadAssetsErrorSchema = z.object({
  error: z
    .union([
      z.literal('start-lands-limit-exceeded'),
      z.literal('cannot-have-train-block-in-world-lands'),
      z.literal('only-one-land-can-have-a-start-block'),
      z.literal('cannot-remove-start-block'),
      z.literal('must-have-start-block-in-first-land'),
      z.literal('cannot-have-start-block-in-admin-lands'),
    ])
    .optional(),
});

const uploadAssetsResponseSchema = z.union([
  z.object({
    status: z.literal(204),
    body: z.undefined(),
  }),
  z.object({
    status: z.literal(409),
    body: z.union([z.undefined(), uploadAssetsErrorSchema]),
  }),
]) satisfies z.ZodType<
  | { status: 204; body: undefined }
  | {
      status: 409;
      body:
        | undefined
        | {
            error?:
              | 'start-lands-limit-exceeded'
              | 'cannot-have-train-block-in-world-lands'
              | 'only-one-land-can-have-a-start-block'
              | 'cannot-remove-start-block'
              | 'must-have-start-block-in-first-land'
              | 'cannot-have-start-block-in-admin-lands';
          };
    }
>;

const updateLandResponseSchema = z.union([
  z.object({
    status: z.literal(200),
    body: z.unknown(),
  }),
  z.object({
    status: z.literal(409),
    body: z.union([
      z.undefined(),
      z.object({
        error: z.string(),
      }),
    ]),
  }),
]) satisfies z.ZodType<
  | { status: 200; body: unknown }
  | { status: 409; body: undefined | { error: string } }
>;

const deleteLandResponseSchema = z.union([
  z.object({
    status: z.literal(200),
    body: z.undefined(),
  }),
  z.object({
    status: z.literal(409),
    body: z.union([
      z.undefined(),
      z.object({
        error: z.string(),
      }),
    ]),
  }),
]) satisfies z.ZodType<
  | { status: 200; body: undefined }
  | { status: 409; body: undefined | { error: string } }
>;

const escapeResponseSchema = z.object({
  status: z.literal(200),
  body: z.undefined(),
}) satisfies z.ZodType<{ status: 200; body: undefined }>;

const getLandsToClaimResponseBodySchema = z.object({
  free: z.number(),
});

const getLandsToClaimResponseSchema = z.object({
  status: z.literal(200),
  body: getLandsToClaimResponseBodySchema,
}) satisfies z.ZodType<{ status: 200; body: GetLandsToClaimDTO }>;

export type GetLandsToClaimDTO = z.infer<typeof getLandsToClaimResponseBodySchema>;

export class LandsAPI {
  constructor(private api: ReturnType<typeof useApiFetchJSON>) {}

  navigate(args: { doorBlockId: string; currentLandId: string }) {
    const query = new URLSearchParams({
      doorBlockId: args.doorBlockId,
      currentLandId: args.currentLandId,
    });

    return this.api.fetchJSON({
      schema: navigateResponseSchema,
      path: `/lands/navigate?${query.toString()}`,
      method: 'GET',
    });
  }

  resume() {
    return this.api.fetchJSON({
      schema: resumeResponseSchema,
      path: '/lands/resume',
      method: 'GET',
    });
  }

  getEditableLand(args: { landId: string }) {
    return this.api.fetchJSON({
      schema: getEditableLandResponseSchema,
      path: `/lands/getEditable/${args.landId}`,
      method: 'GET',
    });
  }

  getLandsIndex() {
    const query = new URLSearchParams({ skip: '0' });

    return this.api.fetchJSON({
      schema: indexLandsResponseSchema,
      path: `/lands?${query.toString()}`,
      method: 'GET',
    });
  }

  async createLand(args: { name: string }): Promise<
    | {
        error: CommunicationError;
      }
    | {
        error?: undefined;
        response:
          | {
              error:
                | 'name-already-taken'
                | 'cannot-create-more-lands-without-start-block';
            }
          | {
              error: 'lands-limit-exceeded';
              limit: number;
            }
          | {
              error?: undefined;
            };
      }
  > {
    const body = {
      name: args.name,
    };

    const res = await this.api.fetchJSON({
      schema: createLandResponseSchema,
      path: '/lands',
      method: 'POST',
      body,
    });

    if (res.error) {
      return res;
    } else {
      if (res.response.status === 409) {
        const body = res.response.body;

        if (
          body.error === 'name-already-taken' ||
          body.error === 'cannot-create-more-lands-without-start-block'
        ) {
          return {
            response: {
              error: body.error,
            },
          };
        } else if (body.error === 'lands-limit-exceeded') {
          return {
            response: {
              error: 'lands-limit-exceeded',
              limit: body.limit,
            },
          };
        } else {
          return {
            error: CommunicationError.UnexpectedResponse,
          };
        }
      } else {
        return {
          response: {},
        };
      }
    }
  }

  async uploadAssets(args: { landId: string; formData: FormData }) {
    const res = await this.api.fetchJSON({
      schema: uploadAssetsResponseSchema,
      path: `/lands/${args.landId}/assets`,
      method: 'PUT',
      body: args.formData,
    });

    if (res.error) {
      return res;
    } else {
      if (res.response.status === 409) {
        const body = res.response.body;

        if (body?.error === 'start-lands-limit-exceeded') {
          Logger.logError(body.error, new Error());
        }

        if (
          body?.error === 'start-lands-limit-exceeded' ||
          body?.error === 'cannot-have-train-block-in-world-lands' ||
          body?.error === 'only-one-land-can-have-a-start-block' ||
          body?.error === 'cannot-remove-start-block' ||
          body?.error === 'must-have-start-block-in-first-land' ||
          body?.error === 'cannot-have-start-block-in-admin-lands'
        ) {
          return {
            error: undefined,
            response: {
              error: body.error,
            } as const,
          };
        } else {
          return {
            error: CommunicationError.UnexpectedResponse,
          };
        }
      } else {
        return {
          error: undefined,
          response: {
            error: undefined,
          },
        };
      }
    }
  }

  updateLand(args: {
    landId: string;
    formData: {
      name: string;
      backgroundMusicUrl?: string | null;
    };
  }) {
    const body = {
      name: args.formData.name,
      backgroundMusicUrl: args.formData.backgroundMusicUrl,
    };

    return this.api.fetchJSON({
      schema: updateLandResponseSchema,
      path: `/lands/${args.landId}`,
      method: 'PUT',
      body,
    });
  }

  async deleteLand(args: { landId: string }): Promise<
    | {
        error: CommunicationError;
      }
    | {
        error?: undefined;
        response:
          | {
              status: 'must-delete-blocks-first';
            }
          | {
              status: 'ok';
            };
      }
  > {
    const res = await this.api.fetchJSON({
      schema: deleteLandResponseSchema,
      path: `/lands/${args.landId}`,
      method: 'DELETE',
    });

    if (res.error) {
      return res;
    } else {
      if (res.response.status === 409) {
        const body = res.response.body;

        if (body?.error === 'must-delete-blocks-first') {
          return {
            response: {
              status: 'must-delete-blocks-first',
            },
          };
        } else {
          return {
            error: CommunicationError.UnexpectedResponse,
          };
        }
      } else {
        return {
          response: {
            status: 'ok',
          },
        };
      }
    }
  }

  escape() {
    return this.api.fetchJSON({
      schema: escapeResponseSchema,
      path: '/lands/escape',
      method: 'PUT',
      body: undefined,
    });
  }

  getLandsToClaim() {
    return this.api.fetchJSON({
      schema: getLandsToClaimResponseSchema,
      path: '/lands/getLandsToClaim',
      method: 'GET',
    });
  }
}

export function useLandsAPI() {
  const api = useApiFetchJSON();

  return new LandsAPI(api);
}
