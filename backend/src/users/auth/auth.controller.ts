import {
  AuthSessionDTO,
  LoginRequestDTO,
  LoginResponseDTO,
} from '@shared/src/auth/auth.dto';
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
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { AuthContext } from './auth-context';
import {
  WithAuthContext,
  WithOptionalAuthContext,
} from './auth-context.decorator';
import { PublicRoute } from './public-route.decorator';
import { FirebaseService } from 'src/firebase/firebase.service';
import { DataSource } from 'typeorm';
import { UsersRepository } from 'src/users/users.repository';
import { AuthTokensService } from './tokens/auth-tokens.service';
import { AUTH_TOKEN_HTTP_ONLY_KEY_COOKIE } from './auth.constants';
import { User } from 'src/users/user.entity';
import { Request as RequestType, Response as ResponseType } from 'express';
import { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier';
import { v4 } from 'uuid';
import { EnvironmentVariables } from 'src/environment/environment-variables';

@UseGuards(AuthGuard)
@Controller('auth')
export class AuthController {
  constructor(
    private firebaseService: FirebaseService,
    private dataSource: DataSource,
    private tokensService: AuthTokensService,
  ) {}

  @HttpCode(201)
  @PublicRoute()
  @Post()
  public async login(
    @Body() body: LoginRequestDTO,
    @Request() request: RequestType,
    @Response({ passthrough: true }) response: ResponseType,
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

    let decodedToken: DecodedIdToken;

    try {
      decodedToken = await firebaseAuth.verifyIdToken(body.firebaseIdToken);
    } catch (err) {
      throw new BadRequestException();
    }

    const firebaseUser = await firebaseAuth.getUser(decodedToken.uid);

    const repository = this.dataSource.getCustomRepository(UsersRepository);

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
      const newUser = await repository.create(new User({
        firebaseUid: decodedToken.uid,
        isAdmin: false,
        appId: v4(),
      }));

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
        isAdmin: authContext.user.isAdmin,
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
    response: ResponseType;
    hostname: string;
  }) {
    const token = await this.tokensService.createAuthToken(
      this.dataSource.manager,
      user,
    );

    response.cookie(AUTH_TOKEN_HTTP_ONLY_KEY_COOKIE, token.httpOnlyKey, {
      expires: token.expires,
      httpOnly: true,
      secure: EnvironmentVariables.NODE_ENV === "production",
      domain: hostname,
      sameSite: EnvironmentVariables.NODE_ENV === "production" ? 'none' : undefined,
    });

    return {
      authTokenId: token.id,
      session: {
        userId: user.id,
        isAdmin: user.isAdmin,
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
