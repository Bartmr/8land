import { z } from 'zod';
import {
  useMainApiFetchJSON,
} from '../../fetch-json';
import {
  GetUserWalletNonce,
  ReceiveSignedUserNonceRequestDTO,
} from './users.dtos';

const getWalletNonceResponseSchema = z.object({
  status: z.literal(200),
  body: z.object({
    walletNonce: z.string(),
  }),
}) satisfies z.ZodType<{ status: 200; body: GetUserWalletNonce }>;

const sendSignedWalletNonceResponseSchema = z.object({
  status: z.literal(204),
  body: z.undefined(),
}) satisfies z.ZodType<{ status: 204; body: undefined }>;

export class UsersAPI {
  constructor(private api: ReturnType<typeof useMainApiFetchJSON>) {}

  getWalletNonce() {
    return this.api.fetchJSON({
      schema: getWalletNonceResponseSchema,
      path: '/users/me/walletNonce',
      method: 'GET',
    });
  }

  sendSignedWalletNonce(args: { signedNonce: string }) {
    const body: ReceiveSignedUserNonceRequestDTO = args;

    return this.api.fetchJSON({
      schema: sendSignedWalletNonceResponseSchema,
      path: '/users/me/walletNonce',
      method: 'PATCH',
      body,
    });
  }
}

export function useUsersAPI() {
  const api = useMainApiFetchJSON();

  return new UsersAPI(api);
}
