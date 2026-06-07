import React from "react";
import { useContext, useEffect } from "react";
import { useMainApiFetchJSON } from "../../main-api/fetch-json";
import { z } from "zod";
import { throwError } from "../../throw-error";
import { AuthenticationStateContext } from "./authentication-state";
import { AuthenticationSessionSchema } from "./authentication-schemas";

export function AuthenticationEffects() {
  const mainApi = useMainApiFetchJSON();
  const { sessionState, setSessionState } =
    useContext(AuthenticationStateContext) || throwError();

  console.log(JSON.stringify(sessionState))

  useEffect(() => {
    (async () => {
      if (
        sessionState.data === undefined &&
        !sessionState.loading &&
        !sessionState.error
      ) {
        setSessionState({ loading: true });

        const res = await mainApi.fetchJSON({
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
  }, [sessionState, mainApi, setSessionState]);

  return <></>;
}
