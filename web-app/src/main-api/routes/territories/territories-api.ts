import {
  MainJSONApi,
  useMainJSONApi,
} from '../../use-main-json-api';
import { GetTerritoryDTO, CreateTerritoryResponseDTO } from './territories.dtos';

export class TerritoriesAPI {
  constructor(private api: MainJSONApi) {}

  getTerritory(args: { territoryId: string }) {
    return this.api.get<
      { status: 200; body: GetTerritoryDTO },
      undefined
    >({
      path: `/territories/${args.territoryId}`,
      query: undefined,
      acceptableStatusCodes: [200],
    });
  }

  createTerritory(data: FormData) {
    return this.api.post<
      | {
          status: 201;
          body: CreateTerritoryResponseDTO;
        }
      | { status: 409; body: { error: string } },
      undefined,
      FormData
    >({
      path: '/territories',
      body: data,
      query: undefined,
      acceptableStatusCodes: [201, 409],
    });
  }

  uploadAssets(args: { territoryId: string; formData: FormData }) {
    return this.api.put<
      | { status: 204; body: undefined }
      | {
          status: 400;
          body:
            | undefined
            | {
                error?:
                  | 'train-and-start-block-not-allowed'
                  | 'tileset-dimensions-dont-match';
              };
        },
      undefined,
      FormData
    >({
      path: `/territories/${args.territoryId}/assets`,
      query: undefined,
      acceptableStatusCodes: [204],
      body: args.formData,
    });
  }
}

export function useTerritoriesAPI() {
  const api = useMainJSONApi();

  return new TerritoriesAPI(api);
}
