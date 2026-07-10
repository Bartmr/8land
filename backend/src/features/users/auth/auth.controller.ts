import {
  AuthSessionDTO,
  LoginRequestDTO,
  LoginResponseDTO,
  SignupRequestDTO,
} from 'src/features/users/auth/auth.dtos';
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
import {
  AuthContext,
  WithAuthContext,
  WithOptionalAuthContext,
  PublicRoute,
} from './auth.guard';
import { DataSource } from 'typeorm';
import { User } from 'src/features/users/user.entities';
import { AuthSessionsService } from './sessions/auth-sessions.service';
import { type Request as RequestType, type Response as ResponseType } from 'express';
import { v4 } from 'uuid';
import { EnvironmentVariables } from 'src/core/environment-variables/environment-variables';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import { loginRequestSchema, signupRequestSchema } from './auth.schemas';
import { ZodValidationPipe } from 'src/core/validation/zod.pipe';

const SALT_ROUNDS = 10;

@UseGuards(AuthGuard)
@Controller('/users/auth')
export class AuthController {
  constructor(
    private dataSource: DataSource,
    private authSessionsService: AuthSessionsService,
  ) {}

  @HttpCode(201)
  @PublicRoute()
  @Post('/login')
  public async login(
    @Body(new ZodValidationPipe(loginRequestSchema)) body: LoginRequestDTO,
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

    const user = await this.dataSource.getRepository(User).findOne({
      where: {
        email: body.email,
      },
    });

    if (!user) {
      throw new NotFoundException();
    }

    const passwordValid = await bcrypt.compare(body.password, user.passwordHash);

    if (!passwordValid) {
      throw new NotFoundException();
    }

    return this.createTokenAndReturnResponse({
      user,
      response,
      hostname,
    });
  }

  @HttpCode(201)
  @PublicRoute()
  @Post('/signup')
  public async signup(
    @Body(new ZodValidationPipe(signupRequestSchema)) body: SignupRequestDTO,
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

    const existingUser = await this.dataSource.getRepository(User).findOne({
      where: {
        email: body.email,
      },
    });

    if (existingUser) {
      throw new ConflictException();
    }

    const passwordHash = await bcrypt.hash(body.password, SALT_ROUNDS);

    const user = await this.dataSource.getRepository(User).save(new User({
      email: body.email,
      passwordHash,
      isAdmin: false,
      appId: v4(),
    }));

    return this.createTokenAndReturnResponse({
      user,
      response,
      hostname,
    });
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
      expires: new Date(exp * 1000),
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
