import {
  AuthSessionDTO,
  LoginRequestDTO,
  LoginResponseDTO,
} from 'src/users/auth/auth.dto';
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
import { AuthSessionsService } from './sessions/auth-sessions.service';
import { User } from 'src/users/user.entity';
import { type Request as RequestType, type Response as ResponseType } from 'express';
import { type DecodedIdToken } from 'firebase-admin/auth';
import { v4 } from 'uuid';
import { EnvironmentVariables } from 'src/environment-variables/environment-variables';
import * as jwt from 'jsonwebtoken';

@UseGuards(AuthGuard)
@Controller('/users/auth')
export class AuthController {
  constructor(
    private firebaseService: FirebaseService,
    private dataSource: DataSource,
    private authSessionsService: AuthSessionsService,
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

    let user = await repository.findOne({
      where: {
        firebaseUid: decodedToken.uid,
      },
    });

    if (!user) {
      const newUser = await repository.create(new User({
        firebaseUid: decodedToken.uid,
        isAdmin: false,
        appId: v4(),
      }));

      await firebaseAuth.setCustomUserClaims(firebaseUser.uid, {
        userIdInDatabase: newUser.id,
      });

    }   

    if (firebaseUser.emailVerified) {
      return this.createTokenAndReturnResponse({
        user,
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
    const session = await this.authSessionsService.createSession(
      this.dataSource.manager,
      user,
    );
    
    const exp = Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 365)

    const token = jwt.sign({
      exp,
      data: {
        sessionId: session.id,
      }
    }, EnvironmentVariables.JWT_SECRET);

    response.cookie('user-authentication-token', token, {
      expires: new Date(exp),
      httpOnly: true,
      secure: EnvironmentVariables.NODE_ENV === "production",
      domain: hostname,
      sameSite: EnvironmentVariables.NODE_ENV === "production" ? 'none' : undefined,
    });

    return {
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
    await this.authSessionsService.deleteAllSessionsFromUser(authContext.user);

    throw new UnauthorizedException();
  }
}
