import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  SetMetadata,
  createParamDecorator,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthSessionsService } from './sessions/auth-sessions.service';
import { AppRequest } from 'src/core/requests/request-types';
import { Response } from 'express';
import { throwError } from 'src/core/throw-error';
import { User } from 'src/features/users/user.entities';

export class AuthContext {
  user: User;

  constructor(params: { user: User }) {
    this.user = params.user;
  }
}

export const WithAuthContext = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): AuthContext => {
    const request = ctx.switchToHttp().getRequest<AppRequest>();

    return request.authContext ?? throwError();
  },
);

export const WithOptionalAuthContext = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): AuthContext | undefined => {
    const request = ctx.switchToHttp().getRequest<AppRequest>();

    return request.authContext;
  },
);

export type PublicRouteMetadata = boolean;
export const PUBLIC_ROUTE_METADATA_KEY = 'publicRoute';

export const PublicRoute = () => {
  const metadata: PublicRouteMetadata = true;

  return SetMetadata(PUBLIC_ROUTE_METADATA_KEY, metadata);
};

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private tokensService: AuthSessionsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<true> {
    if (context.getType() !== 'http') {
      throw new Error('Unknown execution context');
    }

    const request = context
      .switchToHttp()
      .getRequest<AppRequest>();

    const response = context.switchToHttp().getResponse<Response>();

    const isPublic = this.reflector.get<PublicRouteMetadata | undefined>(
      PUBLIC_ROUTE_METADATA_KEY,
      context.getHandler(),
    );

    const authToken = request.cookies['user-authentication-token'];

    if (authToken) {
      const user = await this.tokensService.verifyAuthToken(
        authToken,
        response,
      );

      const authContext = new AuthContext({ user });
      request.authContext = authContext;
    }

    if (isPublic) {
      return true;
    } 

    if (request.authContext) {
      return true;
    } else {
      throw new UnauthorizedException();
    }
  }
}
