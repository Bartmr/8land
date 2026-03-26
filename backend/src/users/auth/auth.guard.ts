import { uuid } from '@shared/src/internals/validation/schemas/uuid.schema';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AppServerRequest } from 'src/server/types/app-server-request-types';
import { AuthContext } from './auth-context';
import { AUTH_TOKEN_HTTP_ONLY_KEY_COOKIE } from './auth.constants';
import {
  PublicRouteMetadata,
  PUBLIC_ROUTE_METADATA_KEY,
} from './public-route.decorator';
import { ADMIN_ONLY_METADATA_KEY } from './admin-only.decorator';
import { AuthTokensService } from './tokens/auth-tokens.service';
import { string } from 'not-me/lib/schemas/string/string-schema';
import { isUUID } from 'src/uuids/is-uuid';
import { AuditContext } from 'src/auditing/audit-context';
import { generateUniqueUUID } from 'src/uuids/generate-unique-uuid';

const authTokenIdSchema = string()
  .test((s) =>
    s == undefined || s.startsWith('Bearer ') ? null : 'must-be-bearer-scheme',
  )
  .transform((s) => (s ? s.replace('Bearer ', '') : s))
  .test((s) => (s == undefined || isUUID(s) ? null : 'must-be-uuid'));

const authTokenKeySchema = uuid().required();

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

    const request: AppServerRequest = context
      .switchToHttp()
      .getRequest<AppServerRequest>();

    request.auditContext = new AuditContext({
      operationId: generateUniqueUUID(),
      requestPath: request.path,
      requestMethod: request.method,
      authContext: null,
    });

    const isPublic = this.reflector.get<PublicRouteMetadata | undefined>(
      PUBLIC_ROUTE_METADATA_KEY,
      context.getHandler(),
    );

    const authTokenIdValidationResult = authTokenIdSchema.validate(
      request.header('authorization'),
    );

    if (authTokenIdValidationResult.errors) {
      throw new UnauthorizedException();
    }

    const authTokenId = authTokenIdValidationResult.value;

    if (authTokenId) {
      const authTokenKeyFromCookie = (
        request.cookies as { [key: string]: unknown }
      )[AUTH_TOKEN_HTTP_ONLY_KEY_COOKIE];

      const authTokenKeyValidation = authTokenKeySchema.validate(
        authTokenKeyFromCookie,
      );

      if (authTokenKeyValidation.errors) {
        throw new UnauthorizedException();
      }

      const authTokenKey = authTokenKeyValidation.value;

      const user = await this.tokensService.validateAuthToken(
        authTokenId,
        authTokenKey,
      );

      const authContext = new AuthContext({ user });
      request.authContext = authContext;
      request.auditContext.authContext = authContext;
    }

    if (isPublic) {
      return true;
    } else {
      if (request.authContext) {
        const isAdminOnly = this.reflector.get<true | undefined>(
          ADMIN_ONLY_METADATA_KEY,
          context.getHandler(),
        );

        if (isAdminOnly && !request.authContext.user.isAdmin) {
          throw new ForbiddenException();
        }

        return true;
      } else {
        throw new UnauthorizedException();
      }
    }
  }
}
