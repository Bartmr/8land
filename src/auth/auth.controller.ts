import {
  AuthSessionDTO,
  LoginRequestDTO,
  LoginResponseDTO,
} from 'libs/shared/src/auth/auth.dto';
import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Post,
  Request,
  Response,
} from '@nestjs/common';
import { AppServerRequest } from 'src/internals/server/types/app-server-request-types';
import { AppServerResponse } from 'src/internals/server/types/app-server-response-types';
import { AuthContext } from './auth-context';
import { WithOptionalAuthContext } from './auth-context.decorator';
import { PublicRoute } from './public-route.decorator';
import { FirebaseService } from 'src/internals/apis/firebase/firebase.service';
import { UnwrapPromise } from 'libs/shared/src/internals/utils/types/promise-types';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import { UsersRepository } from 'src/users/users.repository';
import { AuthTokensService } from './tokens/auth-tokens.service';
import { AUTH_TOKEN_HTTP_ONLY_KEY_COOKIE } from './auth.constants';
import { NODE_ENV } from 'src/internals/environment/node-env.constants';
import { NodeEnv } from 'src/internals/environment/node-env.types';
import { generateRandomUUID } from 'src/internals/utils/generate-random-uuid';
import { Role } from './roles/roles';
import { WithAuditContext } from 'src/internals/auditing/audit.decorator';
import { AuditContext } from 'src/internals/auditing/audit-context';

@Controller('auth')
export class AuthController {
  constructor(
    private firebaseService: FirebaseService,
    @InjectConnection() private connection: Connection,
    private tokensService: AuthTokensService,
  ) {}

  @HttpCode(201)
  @PublicRoute()
  @Post()
  public async login(
    @Body() body: LoginRequestDTO,
    @Request() request: AppServerRequest,
    @Response({ passthrough: true }) response: AppServerResponse,
    @WithAuditContext() auditContext: AuditContext,
    @WithOptionalAuthContext() authContext?: AuthContext,
  ): Promise<LoginResponseDTO> {
    const hostname = request.hostname;

    if (!hostname) {
      throw new BadRequestException();
    }

    if (authContext) {
      throw new BadRequestException();
    }

    const firebaseAuth = this.firebaseService.getAuth();

    let decodedToken: UnwrapPromise<
      ReturnType<typeof firebaseAuth['verifyIdToken']>
    >;

    try {
      decodedToken = await firebaseAuth.verifyIdToken(body.firebaseIdToken);
    } catch (err) {
      throw new BadRequestException();
    }

    const firebaseUser = await firebaseAuth.getUser(decodedToken.uid);

    const repository = this.connection.getCustomRepository(UsersRepository);

    const user = await repository.findOne({
      where: {
        firebaseUid: decodedToken.uid,
      },
    });

    if (user) {
      if (!firebaseUser.emailVerified) {
        throw new ConflictException({ error: 'needs-verification' });
      }

      const token = await this.tokensService.createAuthToken(
        this.connection.manager,
        user,
      );

      response.cookie(AUTH_TOKEN_HTTP_ONLY_KEY_COOKIE, token.httpOnlyKey, {
        expires: token.expires,
        httpOnly: true,
        secure: NODE_ENV === NodeEnv.Production,
        domain: hostname,
        sameSite: NODE_ENV === NodeEnv.Production ? 'none' : undefined,
      });

      return {
        authTokenId: token.id,
        session: {
          userId: user.id,
          role: user.role,
          walletAddress: user.walletAddress,
          appId: user.appId,
        },
      };
    } else {
      await repository.create(
        {
          firebaseUid: decodedToken.uid,
          role: Role.EndUser,
          walletAddress: null,
          walletNonce: generateRandomUUID(),
          appId: generateRandomUUID(),
        },
        auditContext,
      );

      throw new ConflictException({
        error: 'needs-verification',
        createdNewUser: true,
      });
    }
  }

  @Get()
  @PublicRoute()
  public async getSession(
    @WithOptionalAuthContext() authContext?: AuthContext,
  ): Promise<AuthSessionDTO> {
    if (authContext) {
      return {
        userId: authContext.user.id,
        role: authContext.user.role,
        walletAddress: authContext.user.walletAddress,
        appId: authContext.user.appId,
      };
    } else {
      throw new NotFoundException();
    }
  }
}
