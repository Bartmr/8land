import {
  MainJSONApi,
  useMainJSONApi,
} from '../../use-main-json-api';
import { GetUserWalletNonce } from '@shared/src/users/me/get-user-wallet-nonce.dto';
import { ReceiveSignedUserNonceRequestDTO } from '@shared/src/users/me/receive-signed-user-nonce.dto';

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
