import { Request } from 'express';
import { AuthContext } from 'src/users/auth/auth.guard';

export type AppRequest = Request & {
  authContext?: AuthContext;
};