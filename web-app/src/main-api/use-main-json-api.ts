import { JSONApiBase } from './json-api-base';
import { useJSONHttp } from './use-json-http';
import { USER_AUTH_TOKEN_ID_LOCAL_STORAGE_KEY } from '../users/auth/user-auth-constants';
import { useLocalStorage } from '../local-storage';
import { useUserAuthLogout } from '../users/auth/use-user-auth-logout';
import { UserAuthTokenIdLocalStorageSchema } from '../users/auth/user-auth-schemas';
import { EnvironmentVariables } from '../environment-variables';

export class MainJSONApi extends JSONApiBase {}

export function useMainJSONApi() {
  /*
    Note:
    calling useUserAuth here will cause an endless loop
    since useUserAuth itself already calls and uses useMainJSONApi

    To get tokens and other information,
    read them from the Redux Store or directly from the Local Storage
  */
  const jsonHttp = useJSONHttp();
  const localStorage = useLocalStorage();
  const mainApiSessionLogout = useUserAuthLogout();

  return new MainJSONApi({
    jsonHttp,
    apiUrl: EnvironmentVariables.MAIN_API_URL,
    getHeaders: () => {
      const authTokenId = localStorage.getItem(
        UserAuthTokenIdLocalStorageSchema,
        USER_AUTH_TOKEN_ID_LOCAL_STORAGE_KEY,
      );

      if (authTokenId) {
        return {
          Authorization: `Bearer ${authTokenId}`,
        };
      } else {
        return {};
      }
    },
    onInvalidAuthToken: async () => {
      await mainApiSessionLogout.logout();
    },
  });
}
