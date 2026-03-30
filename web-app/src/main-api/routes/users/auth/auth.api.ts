import {
  MainJSONApi,
  useMainJSONApi,
} from '../../../use-main-json-api';

export class AuthAPI {
  constructor(private api: MainJSONApi) {}

  logoutFromAllDevices() {
    return this.api.delete<{ status: number; body: unknown }, undefined>({
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
