import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { throwError } from 'src/throw-error';
import { AuthContext } from './auth-context';
import { AppRequest } from 'src/requests/request-types';

export const WithAuthContext = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): AuthContext => {
    const request = ctx.switchToHttp().getRequest<AppRequest>();

    return request.authContext ?? throwError();
  },
);

export const WithOptionalAuthContext = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): undefined | AuthContext => {
    const request = ctx.switchToHttp().getRequest<AppRequest>();

    return request.authContext;
  },
);
