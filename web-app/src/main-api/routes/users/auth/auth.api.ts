import { z } from 'zod';
import { useMainApiFetchJSON } from '../../../fetch-json';

type MainApiFetchJSON = ReturnType<typeof useMainApiFetchJSON>;

const logoutFromAllDevicesResponseSchema = z.object({
  status: z.number(),
  body: z.unknown(),
});

export class AuthAPI {
  constructor(private api: MainApiFetchJSON) {}

  logoutFromAllDevices() {
    return this.api.fetchJSON({
      schema: logoutFromAllDevicesResponseSchema,
      path: '/auth',
      method: 'DELETE',
    });
  }
}

export function useAuthAPI() {
  const api = useMainApiFetchJSON();

  return new AuthAPI(api);
}
