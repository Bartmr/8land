import {
  MainJSONApi,
  useMainJSONApi,
} from '../app-internals/apis/main/use-main-json-api';
import { ToIndexedType } from '@app/shared/internals/transports/dto-types';
import { GetUserWalletNonce } from '@app/shared/users/me/get-user-wallet-nonce.dto';
import { ReceiveSignedUserNonceRequestDTO } from '@app/shared/users/me/receive-signed-user-nonce.dto';

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
