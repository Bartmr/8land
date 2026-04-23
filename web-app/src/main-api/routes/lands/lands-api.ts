import { z } from 'zod';
import {
  CreateLandRequestDTO,
  EditLandBodyDTO,
  GetLandDTO,
  NavigateToLandDTO,
  ResumeLandNavigationDTO,
  IndexLandsDTO,
  GetLandsToClaimDTO,
} from './lands.dtos';
import {
  useMainApiFetchJSON,
} from '../../fetch-json';
import { Logger } from '../../../logging/logger';
import { CommunicationError } from '../../../communication-errors/communication-errors';

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

const landTerritorySchema = z.object({
  id: z.string(),
  startX: z.number(),
  startY: z.number(),
  endX: z.number(),
  endY: z.number(),
  doorBlocks: z.array(landDoorBlockEntrySchema),
  appBlocks: z.array(landAppBlockEntrySchema),
  assets: z.union([z.undefined(), landAssetsSchema]),
});

const landSchema = z.object({
  id: z.string(),
  name: z.string(),
  backgroundMusicUrl: z.string().nullable(),
  territories: z.array(landTerritorySchema),
  doorBlocks: z.array(landDoorBlockEntrySchema),
  doorBlocksReferencing: z.array(landDoorReferencingSchema),
  appBlocks: z.array(landAppBlockEntrySchema),
  assets: z.union([z.undefined(), landAssetsSchema]),
  isStartLand: z.boolean(),
}) satisfies z.ZodType<GetLandDTO>;

const navigateResponseSchema = z.object({
  status: z.literal(200),
  body: landSchema,
}) satisfies z.ZodType<{ status: 200; body: NavigateToLandDTO }>;

const resumeResponseSchema = z.object({
  status: z.literal(200),
  body: landSchema.extend({
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
  }),
}) satisfies z.ZodType<{ status: 200; body: ResumeLandNavigationDTO }>;

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
}) satisfies z.ZodType<{ status: 200; body: IndexLandsDTO }>;

const createLandResponseSchema = z.union([
  z.object({
    status: z.literal(201),
    body: z.undefined(),
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
  | { status: 201; body: undefined }
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

const getLandsToClaimResponseSchema = z.object({
  status: z.literal(200),
  body: z.object({
    free: z.number(),
  }),
}) satisfies z.ZodType<{ status: 200; body: GetLandsToClaimDTO }>;

export class LandsAPI {
  constructor(private api: ReturnType<typeof useMainApiFetchJSON>) {}

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
    const body: CreateLandRequestDTO = {
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
    const body: EditLandBodyDTO = {
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
  const api = useMainApiFetchJSON();

  return new LandsAPI(api);
}
