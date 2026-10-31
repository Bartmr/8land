import { useCallback } from "react";
import { CommunicationError } from "../communication-errors/communication-errors";
import { throwError } from "../throw-error";

export const API_URL = process.env.GATSBY_API_URL || throwError();


export type ApiFetchResult =
  | {
      error: CommunicationError;
    }
  | {
      error?: undefined;
      response: Response;
    };

export type ApiFetch = ReturnType<typeof useApiFetch>;

export function useApiFetch() {
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
          error: CommunicationError.ConnectionFailure,
        };
      }

      return {
        response,
      };
    },
    []
  );

  return apiFetch;
}
