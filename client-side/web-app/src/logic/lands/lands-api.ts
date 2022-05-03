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
import { JSONData } from '../app-internals/transports/json-types';

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

  createLand(args: { name: string }) {
    return this.api.post<
      | { status: 201; body: undefined }
      | { status: 409; body: { error: 'name-already-taken' } },
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
  }

  uploadAssets(args: { landId: string; formData: FormData }) {
    return this.api.put<{ status: 204; body: undefined }, undefined, FormData>({
      path: `/lands/${args.landId}/assets`,
      query: undefined,
      acceptableStatusCodes: [204],
      body: args.formData,
    });
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
}

export function useLandsAPI() {
  const api = useMainJSONApi();

  return new LandsAPI(api);
}
