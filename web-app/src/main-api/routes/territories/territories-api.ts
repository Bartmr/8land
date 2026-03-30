import {
  MainJSONApi,
  useMainJSONApi,
} from '../../use-main-json-api';
import { GetTerritoryDTO } from '@shared/src/territories/get/get-territory.dto';
import { GetTerritoryIdByRaribleItemIdDTO } from '@shared/src/territories/get-id-by-rarible-item-id/get-territory-id-by-rarible-item-id.dto';
import { CreateTerritoryResponseDTO } from '@shared/src/territories/create/create-territory.dto';
import { UpdateTerritoryRaribleMetadataRequestDTO } from '@shared/src/territories/update-rarible/update-territory-rarible-metadata.dto';

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

  getTerritoryByRaribleItemId(args: { raribleItemId: string }) {
    return this.api.get<
      {
        status: 200;
        body: GetTerritoryIdByRaribleItemIdDTO;
      },
      undefined
    >({
      path: `/territories/rarible/${args.raribleItemId}`,
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

  updateTerritoryRaribleMetadata(args: {
    territoryId: string;
    data: {
      tokenId: string;
      tokenAddress: string;
    };
  }) {
    return this.api.patch<
      { status: 204; body: undefined },
      undefined,
      UpdateTerritoryRaribleMetadataRequestDTO
    >({
      path: `/territories/${args.territoryId}/rarible`,
      query: undefined,
      body: args.data,
      acceptableStatusCodes: [204],
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
