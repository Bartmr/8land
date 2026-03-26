import { Request } from 'express';
import { AuthContext } from 'src/users/auth/auth-context';

export type AppRequest = Request & {
  authContext?: AuthContext;
};