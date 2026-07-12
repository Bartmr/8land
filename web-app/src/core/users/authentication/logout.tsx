import { useCallback, useContext } from "react";
import { AuthenticationStateContext } from "./authentication-state";
import { throwError } from "../../throw-error";
import { API_URL } from "../../api/fetch";
import { CommunicationError } from "../../communication-errors/communication-errors";
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
      response = await fetch(`${API_URL}/users/auth`, {
        method: "DELETE",
        credentials: "include",
      });
    } catch (err) {
      logger.logError("logout-connection-failure", err);

      setSessionState({
        error: CommunicationError.ConnectionFailure,
      });

      return;
    }

    if (response.status === 200 || response.status === 204 || response.status === 401) {
      setSessionState({
        data: null,
      });
    } else {
      const text = await response.text();

      logger.logError("logout-unexpected-response", new Error(), {
        response: {
          status: response.status,
          text,
        },
      });

      setSessionState({
        error: CommunicationError.UnexpectedResponse,
      });
    }
  }, [logger, setSessionState]);

  return logout;
}
