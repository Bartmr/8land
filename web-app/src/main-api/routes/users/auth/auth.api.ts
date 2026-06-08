import { z } from 'zod';
import { useMainApiFetchJSON } from '../../../fetch-json';
import { AuthenticationSessionSchema } from '../../../../users/authentication/authentication-schemas';

type MainApiFetchJSON = ReturnType<typeof useMainApiFetchJSON>;

const logoutFromAllDevicesResponseSchema = z.object({
  status: z.number(),
  body: z.unknown(),
});

const authResponseSchema = z.object({
  status: z.literal(201),
  body: z.object({
    session: AuthenticationSessionSchema,
  }),
});

export class AuthAPI {
  constructor(private api: MainApiFetchJSON) {}

  login(args: { email: string; password: string }) {
    return this.api.fetchJSON({
      schema: authResponseSchema,
      path: '/users/auth/login',
      method: 'POST',
      body: args,
    });
  }

  signup(args: { email: string; password: string }) {
    return this.api.fetchJSON({
      schema: authResponseSchema,
      path: '/users/auth/signup',
      method: 'POST',
      body: args,
    });
  }

  logoutFromAllDevices() {
    return this.api.fetchJSON({
      schema: logoutFromAllDevicesResponseSchema,
      path: '/users/auth',
      method: 'DELETE',
    });
  }
}

export function useAuthAPI() {
  const api = useMainApiFetchJSON();

  return new AuthAPI(api);
}
