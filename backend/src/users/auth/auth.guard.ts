import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthContext } from './auth-context';
import { AUTH_TOKEN_HTTP_ONLY_KEY_COOKIE } from './auth.constants';
import {
  PublicRouteMetadata,
  PUBLIC_ROUTE_METADATA_KEY,
} from './public-route.decorator';
import { AuthTokensService } from './tokens/auth-tokens.service';
import { z } from 'zod';
import { AppRequest } from 'src/requests/request-types';

const authTokenIdSchema = z
  .string()
  .optional()
  .refine((s) => s === undefined || s.startsWith('Bearer '), 'must-be-bearer-scheme')
  .transform((s) => (s ? s.replace('Bearer ', '') : s))
  .pipe(z.uuid().optional());

const authTokenKeySchema = z.uuid();

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private tokensService: AuthTokensService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<true> {
    if (context.getType() !== 'http') {
      throw new Error('Unknown execution context');
    }

    const request = context
      .switchToHttp()
      .getRequest<AppRequest>();

    const isPublic = this.reflector.get<PublicRouteMetadata | undefined>(
      PUBLIC_ROUTE_METADATA_KEY,
      context.getHandler(),
    );

    const authTokenIdResult = authTokenIdSchema.safeParse(
      request.header('authorization'),
    );

    if (!authTokenIdResult.success) {
      throw new UnauthorizedException();
    }

    const authTokenId = authTokenIdResult.data;

    if (authTokenId) {
      const authTokenKeyFromCookie = (
        request.cookies as { [key: string]: unknown }
      )[AUTH_TOKEN_HTTP_ONLY_KEY_COOKIE];

      const authTokenKeyResult = authTokenKeySchema.safeParse(
        authTokenKeyFromCookie,
      );

      if (!authTokenKeyResult.success) {
        throw new UnauthorizedException();
      }

      const authTokenKey = authTokenKeyResult.data;

      const user = await this.tokensService.validateAuthToken(
        authTokenId,
        authTokenKey,
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
