import { StoreDispatch } from 'src/redux/store-types';
import { useLocalStorage } from 'src/local-storage';
import { useStoreDispatch } from 'src/redux/use-store-dispatch';
import { mainApiReducer } from 'src/main-api/main-api-reducer';
import { LoginResponse, UserAuthSessionData } from './user-auth-types';
import { useMainJSONApi } from 'src/main-api/use-main-json-api';
import { TransportedDataStatus } from 'src/communicated-data/communicated-data-types';
import { LoginRequestDTO } from '@shared/src/auth/auth.dto';
import { USER_AUTH_TOKEN_ID_LOCAL_STORAGE_KEY } from './user-auth-constants';

class UserAuth {
  constructor(
    private mainApi: ReturnType<typeof useMainJSONApi>,
    private dispatch: StoreDispatch<'mainApi'>,
    private localStorage: ReturnType<typeof useLocalStorage>,
  ) {}

  async login(args: { firebaseIdToken: string }) {
    const res = await this.mainApi.post<
      | { status: 201; body: LoginResponse }
      | {
          status: 409;
          body: undefined | { error?: string; createdNewUser?: boolean };
        },
      undefined,
      LoginRequestDTO
    >({
      path: '/auth',
      query: undefined,
      body: args,
      acceptableStatusCodes: [201, 409],
    });

    if (res.failure) {
      return {
        error: res.failure,
      } as const;
    } else if (res.response.status === 409) {
      if (res.response.body?.error === 'needs-verification') {
        return {
          error: 'needs-verification',
          createdNewUser: !!res.response.body.createdNewUser,
        } as const;
      } else {
        return {
          error: res.logAndReturnAsUnexpected().failure,
        } as const;
      }
    } else {
      this.localStorage.setItem(
        USER_AUTH_TOKEN_ID_LOCAL_STORAGE_KEY,
        res.response.body.authTokenId,
      );
      this.setSession(res.response.body.session);

      return 'ok' as const;
    }
  }

  setSession(session: UserAuthSessionData | null) {
    this.dispatch({
      type: 'UPDATE_USER_AUTH_SESSION',
      payload: {
        status: TransportedDataStatus.Done,
        data: session,
      },
    });
  }

  async restoreSession() {
    this.dispatch({
      type: 'UPDATE_USER_AUTH_SESSION',
      payload: {
        status: TransportedDataStatus.Loading,
      },
    });

    const res = await this.mainApi.get<
      | { status: 200; body: UserAuthSessionData }
      | { status: 404; body: undefined },
      undefined
    >({
      path: '/auth',
      query: undefined,
      acceptableStatusCodes: [200, 404],
    });

    if (res.failure) {
      this.dispatch({
        type: 'UPDATE_USER_AUTH_SESSION',
        payload: {
          status: res.failure,
        },
      });
    } else {
      if (res.response.status === 404) {
        this.setSession(null);
      } else {
        this.setSession(res.response.body);
      }
    }
  }

  async refreshSession() {
    const res = await this.mainApi.get<
      | { status: 200; body: UserAuthSessionData }
      | { status: 404; body: undefined },
      undefined
    >({
      path: '/auth',
      query: undefined,
      acceptableStatusCodes: [200, 404],
    });

    if (res.failure) {
      this.dispatch({
        type: 'UPDATE_USER_AUTH_SESSION',
        payload: {
          status: res.failure,
        },
      });

      return undefined;
    } else {
      if (res.response.status === 404) {
        this.setSession(null);
        return null;
      } else {
        this.setSession(res.response.body);
        return res.response.body;
      }
    }
  }
}

export function useUserAuth() {
  const mainApi = useMainJSONApi();

  const dispatch = useStoreDispatch({ mainApi: mainApiReducer });

  const localStorage = useLocalStorage();

  return new UserAuth(mainApi, dispatch, localStorage);
}
