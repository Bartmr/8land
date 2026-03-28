import {
  MainJSONApi,
  useMainJSONApi,
} from '../main-api/use-main-json-api';
import { ToIndexedType } from '@shared/internals/transports/dto-types';
import { GetUserWalletNonce } from '@shared/users/me/get-user-wallet-nonce.dto';
import { ReceiveSignedUserNonceRequestDTO } from '@shared/users/me/receive-signed-user-nonce.dto';

export class UsersAPI {
  constructor(private api: MainJSONApi) {}

  getWalletNonce() {
    return this.api.get<
      { status: 200; body: ToIndexedType<GetUserWalletNonce> },
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
      ToIndexedType<ReceiveSignedUserNonceRequestDTO>
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
