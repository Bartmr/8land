import { ToIndexedType } from '@app/shared/internals/transports/dto-types';
import { CreateLandRequestDTO } from '@app/shared/land/create/create-land.dto';
import { EditLandBodyDTO } from '@app/shared/land/edit/edit-land.dto';
import { GetLandDTO } from '@app/shared/land/get/get-land.dto';
import { NavigateToLandQueryDTO } from '@app/shared/land/in-game/navigate/navigate-to-land.schemas';
import { ResumeLandNavigationDTO } from '@app/shared/land/in-game/resume/resume-land-navigation.dto';
import {
  IndexLandsDTO,
  IndexLandsQueryDTO,
} from '@app/shared/land/index/index-lands.dto';
import {
  MainJSONApi,
  useMainJSONApi,
} from '../app-internals/apis/main/use-main-json-api';
import { Logger } from '../app-internals/logging/logger';
import { JSONData } from '../app-internals/transports/json-types';
import { TransportFailure } from '../app-internals/transports/transported-data/transport-failures';

export class LandsAPI {
  constructor(private api: MainJSONApi) {}

  navigate(args: { doorBlockId: string; currentLandId: string }) {
    return this.api.get<
      { status: 200; body: ToIndexedType<GetLandDTO> },
      ToIndexedType<NavigateToLandQueryDTO>
    >({
      path: `/lands/navigate`,
      query: {
        doorBlockId: args.doorBlockId,
        currentLandId: args.currentLandId,
      },
      acceptableStatusCodes: [200],
    });
  }

  resume() {
    return this.api.get<
      { status: 200; body: ToIndexedType<ResumeLandNavigationDTO> },
      undefined
    >({
      path: '/lands/resume',
      query: undefined,
      acceptableStatusCodes: [200],
    });
  }

  getEditableLand(args: { landId: string }) {
    return this.api.get<
      { status: 200; body: ToIndexedType<GetLandDTO> },
      undefined
    >({
      path: `/lands/getEditable/${args.landId}`,
      query: undefined,
      acceptableStatusCodes: [200],
    });
  }

  getLandsIndex() {
    return this.api.get<
      { status: 200; body: ToIndexedType<IndexLandsDTO> },
      ToIndexedType<IndexLandsQueryDTO>
    >({
      path: '/lands',
      query: {
        skip: 0,
      },
      acceptableStatusCodes: [200],
    });
  }

  async createLand(args: { name: string }): Promise<
    | {
        failure: TransportFailure;
      }
    | {
        failure?: undefined;
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
    const res = await this.api.post<
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
        },
      undefined,
      ToIndexedType<CreateLandRequestDTO>
    >({
      path: '/lands',
      query: undefined,
      acceptableStatusCodes: [201, 409],
      body: {
        name: args.name,
      },
    });

    if (res.failure) {
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
          return res.logAndReturnAsUnexpected();
        }
      } else {
        return {
          response: {},
        };
      }
    }
  }

  async uploadAssets(args: { landId: string; formData: FormData }) {
    const res = await this.api.put<
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
        },
      undefined,
      FormData
    >({
      path: `/lands/${args.landId}/assets`,
      query: undefined,
      acceptableStatusCodes: [204, 409],
      body: args.formData,
    });

    if (res.failure) {
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
            failure: undefined,
            response: {
              error: body.error,
            } as const,
          };
        } else {
          return res.logAndReturnAsUnexpected();
        }
      } else {
        return {
          failure: undefined,
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
    return this.api.put<
      | { status: 200; body: JSONData }
      | { status: 409; body: undefined | { error: string } },
      undefined,
      ToIndexedType<EditLandBodyDTO>
    >({
      path: `/lands/${args.landId}`,
      query: undefined,
      body: {
        name: args.formData.name,
        backgroundMusicUrl: args.formData.backgroundMusicUrl,
      },
      acceptableStatusCodes: [200, 409],
    });
  }

  async deleteLand(args: { landId: string }): Promise<
    | {
        failure: TransportFailure;
      }
    | {
        failure?: undefined;
        response:
          | {
              status: 'must-delete-blocks-first';
            }
          | {
              status: 'ok';
            };
      }
  > {
    const res = await this.api.delete<
      | { status: 200; body: undefined }
      | { status: 409; body: undefined | { error: string } },
      undefined
    >({
      path: `/lands/${args.landId}`,
      query: undefined,
      acceptableStatusCodes: [200, 409],
    });

    if (res.failure) {
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
          return res.logAndReturnAsUnexpected();
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
}

export function useLandsAPI() {
  const api = useMainJSONApi();

  return new LandsAPI(api);
}
