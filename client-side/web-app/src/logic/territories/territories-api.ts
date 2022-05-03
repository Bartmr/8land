import {
  MainJSONApi,
  useMainJSONApi,
} from '../app-internals/apis/main/use-main-json-api';
import { ToIndexedType } from '@app/shared/internals/transports/dto-types';
import { GetTerritoryDTO } from '@app/shared/territories/get/get-territory.dto';
import { GetTerritoryIdByRaribleItemIdDTO } from '@app/shared/territories/get-id-by-rarible-item-id/get-territory-id-by-rarible-item-id.dto';
import { CreateTerritoryResponseDTO } from '@app/shared/territories/create/create-territory.dto';
import { UpdateTerritoryRaribleMetadataRequestDTO } from '@app/shared/territories/update-rarible/update-territory-rarible-metadata.dto';

export class TerritoriesAPI {
  constructor(private api: MainJSONApi) {}

  getTerritory(args: { territoryId: string }) {
    return this.api.get<
      { status: 200; body: ToIndexedType<GetTerritoryDTO> },
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
        body: ToIndexedType<GetTerritoryIdByRaribleItemIdDTO>;
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
          body: ToIndexedType<CreateTerritoryResponseDTO>;
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
      ToIndexedType<UpdateTerritoryRaribleMetadataRequestDTO>
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
      | { status: 400; body: undefined | { error: string } },
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
