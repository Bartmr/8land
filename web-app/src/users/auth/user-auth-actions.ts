import { TransportedData } from 'src/communicated-data/communicated-data-types';
import { UserAuthSessionData } from './user-auth-types';

export const USER_AUTH_LOGOUT = 'USER_AUTH_LOGOUT';

export type UserAuthAction =
  | {
      type: 'UPDATE_USER_AUTH_SESSION';
      payload: TransportedData<UserAuthSessionData | null>;
    }
  | {
      type: typeof USER_AUTH_LOGOUT;
    }
  | {
      type: 'FINISHED_LOGGING_OUT';
    };
