import { useCallback, useContext } from "react";
import { ApiFetchErrors } from "./fetch-errors";
import { throwError } from "../throw-error";
import { useAuthenticationLogout } from "../users/authentication/logout";
import { AuthenticationStateContext } from "../users/authentication/authentication-state";

export const API_URL = process.env.GATSBY_API_URL || throwError();


export type ApiFetchResult =
  | {
      error: ApiFetchErrors;
    }
  | {
      error?: undefined;
      response: Response;
    };

export type ApiFetch = ReturnType<typeof useApiFetch>;

export function useApiFetch() {
  const logout = useAuthenticationLogout();
  const { setSessionState } = useContext(AuthenticationStateContext) || throwError();

  const apiFetch = useCallback(
    async (path: string, init: RequestInit) => {
      let response: Response;

      try {
        response = await fetch(`${API_URL}${path}`, {
          ...init,
          credentials: "include",
        });
      } catch {
        return {
          error: ApiFetchErrors.ConnectionFailure,
        };
      }

      if (response.status === 401) {
        await logout();

        setSessionState({ data: null })

        return {
          error: ApiFetchErrors.Aborted
        }
      }

      return {
        response,
      };
    },
    []
  );

  return apiFetch;
}
