import {
  MainJSONApi,
  useMainJSONApi,
} from '../main-api/use-main-json-api';
import { JSONData } from '../transports/json-types';

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
