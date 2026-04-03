import {
  StoreDispatch,
  StoreGetState,
} from '../../redux/store-types';
import { USER_AUTH_LOGOUT } from './user-auth-actions';
import { useSessionStorage } from '../../session-storage';
import { useLocalStorage } from '../../local-storage';
import { useStoreDispatch } from '../../redux/use-store-dispatch';
import { mainApiReducer } from '../../main-api/main-api-reducer';
import { useStoreGetState } from '../../redux/use-store-get-state';
import { TransportedDataStatus } from '../../communicated-data/communicated-data-types';

class UserAuthLogout {
  constructor(
    private getState: StoreGetState<'mainApi'>,
    private dispatch: StoreDispatch<'mainApi'>,
    private localStorage: ReturnType<typeof useLocalStorage>,
    private sessionStorage: ReturnType<typeof useSessionStorage>,
  ) {}

  async logout() {
    const state = this.getState();

    if (state.mainApi.isLoggingOut) {
      return;
    }
    this.dispatch({
      type: USER_AUTH_LOGOUT,
    });

    /* ----- */

    const { FirebaseAuth } = await import('../../firebase/firebase-auth');

    await FirebaseAuth.signOut();

    this.localStorage.wipeAll();
    this.sessionStorage.wipeAll();

    this.dispatch({
      type: 'UPDATE_USER_AUTH_SESSION',
      payload: {
        status: TransportedDataStatus.NotInitialized,
      },
    });
  }
}

export function useUserAuthLogout() {
  const dispatch = useStoreDispatch({ mainApi: mainApiReducer });
  const getMainApiState = useStoreGetState({ mainApi: mainApiReducer });

  const localStorage = useLocalStorage();
  const sessionStorage = useSessionStorage();

  return new UserAuthLogout(
    getMainApiState,
    dispatch,
    localStorage,
    sessionStorage,
  );
}
