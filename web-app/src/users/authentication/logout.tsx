import { useCallback, useContext } from "react";
import { AccountantAuthenticationStateContext } from "./authentication-state";
import { throwError } from "../../throw-error";
import { MAIN_API_URL } from "../../main-api/urls";
import { CommunicationError } from "../../communication-errors/communication-errors";
import { useLogger } from "../../logging/logger";

export function useAccountantLogout() {
  const logger = useLogger();
  const { setSessionState } =
    useContext(AccountantAuthenticationStateContext) || throwError();

  const logout = useCallback(async () => {
    setSessionState({
      loading: true,
    });

    let response: Response;

    try {
      response = await fetch(`${MAIN_API_URL}/accountant_users/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      logger.logError(err);

      setSessionState({
        error: CommunicationError.ConnectionFailure,
      });

      return;
    }

    if (response.status === 200) {
      setSessionState({
        data: null,
      });
    } else {
      const text = await response.text();

      logger.logError(new Error(), {
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
