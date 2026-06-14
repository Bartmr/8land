import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthContext } from './auth-context';
import {
  PublicRouteMetadata,
  PUBLIC_ROUTE_METADATA_KEY,
} from './public-route.decorator';
import { AuthSessionsService } from './sessions/auth-sessions.service';
import { AppRequest } from 'src/requests/request-types';
import { Response } from 'express';

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

    const response = context.switchToHttp().getResponse<Response>()

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
    } else {
      if (request.authContext) {
        return true;
      } else {
        throw new UnauthorizedException();
      }
    }
  }
}
