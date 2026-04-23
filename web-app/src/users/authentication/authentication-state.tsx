import React from "react";
import {
  Dispatch,
  SetStateAction,
  createContext,
  useContext,
  useMemo,
  useState,
} from "react";
import { CommunicationError } from "../../communication-errors/communication-errors";
import { z } from "zod";
import { AuthenticationSessionSchema } from "./authentication-schemas";
import { throwError } from "../../throw-error";

type AuthenticationSession = z.TypeOf<typeof AuthenticationSessionSchema>;
type AuthenticationSessionState = {
  loading?: boolean;
  error?: CommunicationError;
  data?: null | AuthenticationSession;
};

type AuthenticationStateContextValue = {
  sessionState: AuthenticationSessionState;
  setSessionState: Dispatch<SetStateAction<AuthenticationSessionState>>;
};

export const AuthenticationStateContext = createContext<
  AuthenticationStateContextValue | undefined
>(undefined);

export function AuthenticationStateProvider(props: {
  children: React.ReactNode;
}) {
  const [sessionState, setSessionState] = useState<AuthenticationSessionState>({});

  const value = useMemo(() => {
    return {
      sessionState,
      setSessionState,
    };
  }, [sessionState]);

  return (
    <AuthenticationStateContext.Provider value={value}>
      {props.children}
    </AuthenticationStateContext.Provider>
  );
}

export function useAuthenticationSession() {
  const { sessionState } =
    useContext(AuthenticationStateContext) || throwError();

  if (!sessionState.data) {
    throwError();
  }

  return sessionState.data;
}
