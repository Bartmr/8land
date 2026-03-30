import {
  StoreDispatch,
  StoreGetState,
} from 'src/redux/store-types';
import { USER_AUTH_LOGOUT } from './user-auth-actions';
import { useSessionStorage } from 'src/session-storage';
import { useLocalStorage } from 'src/local-storage';
import { useStoreDispatch } from 'src/redux/use-store-dispatch';
import { mainApiReducer } from 'src/main-api/main-api-reducer';
import { useStoreGetState } from 'src/redux/use-store-get-state';
import { TransportedDataStatus } from 'src/transported-data/transported-data-types';

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

    const { FirebaseAuth } = await import('src/firebase/firebase-auth');

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
