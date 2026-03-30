import { Reducer } from 'redux';
import { UserAuthAction } from 'src/users/auth/user-auth-actions';
import { UserAuthSessionData } from 'src/users/auth/user-auth-types';
import {
  TransportedDataStatus,
  TransportedData,
} from '../communicated-data/communicated-data-types';

export type MainApiStoreState = {
  session: TransportedData<UserAuthSessionData | null>;
  isLoggingOut: boolean;
};
export type MainApiReducer = Reducer<MainApiStoreState, UserAuthAction>;

const initialState: MainApiStoreState = {
  session: { status: TransportedDataStatus.NotInitialized },
  isLoggingOut: false,
};

export const mainApiReducer: MainApiReducer = (
  state = initialState,
  action,
) => {
  switch (action.type) {
    case 'UPDATE_USER_AUTH_SESSION':
      return {
        ...state,
        session: action.payload,
      };
    case 'FINISHED_LOGGING_OUT':
      return {
        ...state,
        isLoggingOut: false,
      };
    default:
      return state;
  }
};
