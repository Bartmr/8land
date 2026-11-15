import { useCallback, useContext } from "react";
import { AuthenticationStateContext } from "./authentication-state";
import { throwError } from "../../throw-error";
import { API_URL } from "../../api/fetch";
import { ApiFetchErrors } from "../../api/fetch-errors";
import { useLogger } from "../../logging/logger";

export function useAuthenticationLogout() {
  const logger = useLogger();
  const { setSessionState } =
    useContext(AuthenticationStateContext) || throwError();

  const logout = useCallback(async () => {
    setSessionState({
      loading: true,
    });

    let response: Response;

    try {
      response = await fetch(`${API_URL}/users/auth/this`, {
        method: "DELETE",
        credentials: "include",
      });
    } catch (err) {
      logger.logException("logout-connection-failure", err);

      setSessionState({
        error: ApiFetchErrors.ConnectionFailure,
      });

      return;
    }

    if (response.ok) {
      setSessionState({
        data: null,
      });
    } else {
      const text = await response.text();

      logger.logException("logout-unexpected-response", new Error(), {
        response: {
          status: response.status,
          text,
        },
      });

      setSessionState({
        error: ApiFetchErrors.UnexpectedResponse,
      });
    }
  }, [logger, setSessionState]);

  return logout;
}
