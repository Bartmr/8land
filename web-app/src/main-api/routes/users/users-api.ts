import {
  MainJSONApi,
  useMainJSONApi,
} from '../../use-main-json-api';
import { GetUserWalletNonce, ReceiveSignedUserNonceRequestDTO } from './users.dtos';

export class UsersAPI {
  constructor(private api: MainJSONApi) {}

  getWalletNonce() {
    return this.api.get<
      { status: 200; body: GetUserWalletNonce },
      undefined
    >({
      path: '/users/me/walletNonce',
      query: undefined,
      acceptableStatusCodes: [200],
    });
  }

  sendSignedWalletNonce(args: { signedNonce: string }) {
    return this.api.patch<
      { status: 204; body: undefined },
      undefined,
      ReceiveSignedUserNonceRequestDTO
    >({
      path: '/users/me/walletNonce',
      query: undefined,
      body: args,
      acceptableStatusCodes: [204],
    });
  }
}

export function useUsersAPI() {
  const api = useMainJSONApi();

  return new UsersAPI(api);
}
