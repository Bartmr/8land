import { StoreDispatch } from '../../redux/store-types';
import { useLocalStorage } from '../../local-storage';
import { useStoreDispatch } from '../../redux/use-store-dispatch';
import { mainApiReducer } from '../../main-api/main-api-reducer';
import { UserAuthSessionData } from './user-auth-types';
import { useMainApiFetchJSON } from '../../main-api/fetch-json';
import { TransportedDataStatus } from '../../communicated-data/communicated-data-types';
import { USER_AUTH_TOKEN_ID_LOCAL_STORAGE_KEY } from './user-auth-constants';
import { z } from 'zod';
import { CommunicationError } from '../../communication-errors/communication-errors';

const userAuthSessionDataSchema = z.object({
  userId: z.string(),
  isAdmin: z.boolean(),
  appId: z.string(),
});

const loginResponseSchema = z.discriminatedUnion('status', [
  z.object({
    status: z.literal(201),
    body: z.object({
      authTokenId: z.string(),
      session: userAuthSessionDataSchema,
    }),
  }),
  z.object({
    status: z.literal(409),
    body: z
      .object({
        error: z.string().optional(),
        createdNewUser: z.boolean().optional(),
      })
      .optional(),
  }),
]);

const sessionResponseSchema = z.discriminatedUnion('status', [
  z.object({
    status: z.literal(200),
    body: userAuthSessionDataSchema,
  }),
  z.object({
    status: z.literal(404),
    body: z.undefined(),
  }),
]);

class UserAuth {
  constructor(
    private mainApi: ReturnType<typeof useMainApiFetchJSON>,
    private dispatch: StoreDispatch<'mainApi'>,
    private localStorage: ReturnType<typeof useLocalStorage>,
  ) {}

  async login(args: { firebaseIdToken: string }) {
    const res = await this.mainApi.fetchJSON({
      schema: loginResponseSchema,
      path: '/users/auth',
      method: 'POST',
      body: args,
    });

    if (res.error) {
      return {
        error: res.error,
      } as const;
    } else if (res.response.status === 409) {
      if (res.response.body?.error === 'needs-verification') {
        return {
          error: 'needs-verification',
          createdNewUser: !!res.response.body.createdNewUser,
        } as const;
      } else {
        return {
          error: CommunicationError.UnexpectedResponse,
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

    const res = await this.mainApi.fetchJSON({
      schema: sessionResponseSchema,
      path: '/users/auth',
      method: 'GET',
    });

    if (res.error) {
      this.dispatch({
        type: 'UPDATE_USER_AUTH_SESSION',
        payload: {
          status: res.error,
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
    const res = await this.mainApi.fetchJSON({
      schema: sessionResponseSchema,
      path: '/users/auth',
      method: 'GET',
    });

    if (res.error) {
      this.dispatch({
        type: 'UPDATE_USER_AUTH_SESSION',
        payload: {
          status: res.error,
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
  const mainApi = useMainApiFetchJSON();

  const dispatch = useStoreDispatch({ mainApi: mainApiReducer });

  const localStorage = useLocalStorage();

  return new UserAuth(mainApi, dispatch, localStorage);
}
