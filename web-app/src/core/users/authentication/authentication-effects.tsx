import React from "react";
import { useContext, useEffect } from "react";
import { useApiFetchJSON } from "../../api/fetch-json";
import { z } from "zod";
import { throwError } from "../../throw-error";
import { AuthenticationStateContext } from "./authentication-state";
import { AuthenticationSessionSchema } from "./authentication-schemas";

export function AuthenticationEffects() {
  const api = useApiFetchJSON();
  const { sessionState, setSessionState } =
    useContext(AuthenticationStateContext) || throwError();

  useEffect(() => {
    (async () => {
      if (
        sessionState.data === undefined &&
        !sessionState.loading &&
        !sessionState.error
      ) {
        setSessionState({ loading: true });

        const res = await api.fetchJSON({
          path: "/users/auth",
          method: "GET",
          schema: z.union([
            z.object({
              status: z.literal(404),
            }),
            z.object({
              status: z.literal(200),
              body: AuthenticationSessionSchema,
            }),
          ]),
        });

        if (res.error) {
          setSessionState({
            error: res.error,
          });

          return;
        }

        if (res.response.status === 404) {
          setSessionState({ data: null });

          return;
        }

        setSessionState({ data: res.response.body });
      }
    })();
  }, [sessionState, api, setSessionState]);

  return <></>;
}
