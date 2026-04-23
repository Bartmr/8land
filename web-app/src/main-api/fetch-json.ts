import { useCallback, useMemo } from "react";
import { z } from "zod";
import { CommunicationError } from "../communication-errors/communication-errors";
import { useLogger } from "../logging/logger";
import { MAIN_API_URL } from "./fetch";

export type MainApiFetchJSONResult<T> =
  | {
      error: CommunicationError;
    }
  | {
      error?: undefined;
      response: T;
    };

type MainApiFetchJSON = {
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
  }): Promise<MainApiFetchJSONResult<z.TypeOf<ZodSchema>>>;
};

export function useMainApiFetchJSON() {
  const logger = useLogger();

  const fetchJSON: MainApiFetchJSON = useCallback(async (args) => {
    let response: Response;
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

    try {
      response = await fetch(`${MAIN_API_URL}${args.path}`, {
        method: args.method,
        body,
        headers,
        credentials: "include",
      });
    } catch {
      return {
        error: CommunicationError.ConnectionFailure,
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
        error: CommunicationError.UnexpectedResponse,
      };
    }

    const validationResult = args.schema.safeParse({
      status: response.status,
      body: responseJSON,
    });

    if (!validationResult.success) {
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
        error: CommunicationError.UnexpectedResponse,
      };
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
