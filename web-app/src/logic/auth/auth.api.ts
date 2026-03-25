import {
  MainJSONApi,
  useMainJSONApi,
} from '../app-internals/apis/main/use-main-json-api';
import { JSONData } from '../app-internals/transports/json-types';

export class AuthAPI {
  constructor(private api: MainJSONApi) {}

  logoutFromAllDevices() {
    return this.api.delete<{ status: number; body: JSONData }, undefined>({
      path: '/auth',
      query: undefined,
      acceptableStatusCodes: [],
    });
  }
}

export function useAuthAPI() {
  const api = useMainJSONApi();

  return new AuthAPI(api);
}
