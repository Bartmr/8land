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
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Post,
  Request,
  Response,
  UnauthorizedException,
} from '@nestjs/common';
import { AppServerRequest } from 'src/internals/server/types/app-server-request-types';
import { AppServerResponse } from 'src/internals/server/types/app-server-response-types';
import { AuthContext } from './auth-context';
import {
  WithAuthContext,
  WithOptionalAuthContext,
} from './auth-context.decorator';
import { PublicRoute } from './public-route.decorator';
import { FirebaseService } from 'src/internals/apis/firebase/firebase.service';
import { UnwrapPromise } from 'libs/shared/src/internals/utils/types/promise-types';
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
import { User } from 'src/users/typeorm/user.entity';
import { InjectTypeormConnection } from 'src/internals/databases/inject-typeorm-connection.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private firebaseService: FirebaseService,
    @InjectTypeormConnection() private connection: Connection,
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

      return this.createTokenAndReturnResponse({
        user,
        response,
        hostname,
      });
    } else {
      const newUser = await repository.create(
        {
          firebaseUid: decodedToken.uid,
          role: Role.EndUser,
          walletAddress: null,
          walletNonce: generateRandomUUID(),
          appId: generateRandomUUID(),
        },
        auditContext,
      );

      await firebaseAuth.setCustomUserClaims(firebaseUser.uid, {
        userIdInDatabase: newUser.id,
      });

      if (firebaseUser.emailVerified) {
        return this.createTokenAndReturnResponse({
          user: newUser,
          response,
          hostname,
        });
      } else {
        throw new ConflictException({
          error: 'needs-verification',
          createdNewUser: true,
        });
      }
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

  private async createTokenAndReturnResponse({
    user,
    response,
    hostname,
  }: {
    user: User;
    response: AppServerResponse;
    hostname: string;
  }) {
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
  }

  @Delete()
  async logoutFromAllDevices(
    @WithAuthContext() authContext: AuthContext,
  ): Promise<void> {
    await this.tokensService.deleteAllTokensFromUser(authContext.user);

    throw new UnauthorizedException();
  }
}
