import { useCallback, useContext, useMemo } from "react";
import { z } from "zod";
import { ApiFetchErrors } from "./fetch-errors";
import { useLogger } from "../logging/logger";
import { API_URL } from "./fetch";
import { useAuthenticationLogout } from "../users/authentication/logout";
import { AuthenticationStateContext, useAuthenticationStateSessionData, useAuthenticationStateSession } from "../users/authentication/authentication-state";
import { throwError } from "../throw-error";

export type ApiFetchJSONResult<T> =
  | {
      error: ApiFetchErrors;
    }
  | {
      error?: undefined;
      response: T;
    };

type ApiFetchJSON = {
  <
    ZodSchema extends z.ZodType<{
      status: number;
      body?: unknown;
    }>,
  >(args: {
    schema: ZodSchema;
    path: string;
    body?: unknown;
    method: "HEAD" | "GET" | "DELETE" | "POST" | "PATCH" | "PUT";
  }): Promise<ApiFetchJSONResult<z.TypeOf<ZodSchema>>>;
};

export function useApiFetchJSON() {
  const logger = useLogger();
  const { setSessionState } = useContext(AuthenticationStateContext) || throwError();
  const logout = useAuthenticationLogout();

  const fetchJSON: ApiFetchJSON = useCallback(async (args) => {
    const headers: HeadersInit = {};
    let body: BodyInit | undefined;

    if (["POST", "PATCH", "PUT"].includes(args.method)) {
      if (args.body instanceof FormData) {
        body = args.body;
      } else {
        headers["Content-Type"] = "application/json";
        body = JSON.stringify(args.body);
      }
    }

    let response: Response;

    try {
      response = await fetch(`${API_URL}${args.path}`, {
        method: args.method,
        body,
        headers,
        credentials: "include",
      });
    } catch {
      return {
        error: ApiFetchErrors.ConnectionFailure,
      };
    }

    let responseJSON;
    try {
      const responseText = await response.text();
      responseJSON = responseText ? JSON.parse(responseText) : undefined;
    } catch (error) {
      logger.logError('invalid-response-format', error, {
        request: {
          path: args.path,
          method: args.method,
        },
        response: {
          status: response.status,
        },
      });
      return {
        error: ApiFetchErrors.UnexpectedResponse,
      };
    }

    const validationResult = args.schema.safeParse({
      status: response.status,
      body: responseJSON,
    });

    if (!validationResult.success) {
      if (response.status == 401) {
        await logout();

        setSessionState({ data: null })

        return {
          error: ApiFetchErrors.Aborted
        }
      } else {
        logger.logError('invalid-response-data', new Error(), {
          request: {
            path: args.path,
            method: args.method,
          },
          response: {
            status: response.status,
            body: response.status >= 400 ? responseJSON : undefined,
            validationErrors: validationResult.error.format(),
          },
        });

        return {
          error: ApiFetchErrors.UnexpectedResponse,
        };
      }
    }

    return {
      response: validationResult.data,
    };
  }, [logger]);

  return useMemo(() => {
    return {
      fetchJSON,
    };
  }, [fetchJSON]);
}
