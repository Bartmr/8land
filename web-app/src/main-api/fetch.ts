import { useCallback } from "react";
import { CommunicationError } from "../communication-errors/communication-errors";
import { throwError } from "../throw-error";

export const MAIN_API_URL = process.env.GATSBY_MAIN_API_URL || throwError();


export type MainApiFetchResult =
  | {
      error: CommunicationError;
    }
  | {
      error?: undefined;
      response: Response;
    };

export type MainApiFetch = ReturnType<typeof useMainApiFetch>;

export function useMainApiFetch() {
  const mainApiFetch = useCallback(
    async (path: string, init: RequestInit) => {
      let response: Response;

      try {
        response = await fetch(`${MAIN_API_URL}${path}`, {
          ...init,
          credentials: "include",
        });
      } catch {
        return {
          error: CommunicationError.ConnectionFailure,
        };
      }

      return {
        response,
      };
    },
    []
  );

  return mainApiFetch;
}
