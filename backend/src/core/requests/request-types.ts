import { Request } from 'express';
import { AuthContext } from 'src/features/users/auth/auth.guard';

export type AppRequest = Request & {
  authContext?: AuthContext;
};