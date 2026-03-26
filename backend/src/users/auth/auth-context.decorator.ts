import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AppServerRequest } from 'src/server/types/app-server-request-types';
import { throwError } from 'src/throw-error';
import { EnforceParameterDecoratorTypesafety } from 'src/types/typesafe-parameter-decorators';
import { AuthContext } from './auth-context';

export const WithAuthContext = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): AuthContext => {
    const request = ctx.switchToHttp().getRequest<AppServerRequest>();

    return request.authContext ?? throwError();
  },
  [EnforceParameterDecoratorTypesafety(AuthContext)],
);

export const WithOptionalAuthContext = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): undefined | AuthContext => {
    const request = ctx.switchToHttp().getRequest<AppServerRequest>();

    return request.authContext;
  },
  [EnforceParameterDecoratorTypesafety(AuthContext)],
);
