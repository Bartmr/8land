import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from 'src/users/user.entities';
import { UserAuthSession } from './auth-session.entities';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { EnvironmentVariables } from 'src/environment-variables/environment-variables';
import * as jwt from 'jsonwebtoken';
import z from 'zod';
import { Response } from 'express';

@Injectable()
export class AuthSessionsService {

  private tokensRepository: Repository<UserAuthSession>;

  constructor(
    dataSource: DataSource,
  ) {
    this.tokensRepository =
      dataSource.getRepository(UserAuthSession);
  }

  async createSession(manager: EntityManager, user: User) {
    const token = await manager.getRepository(UserAuthSession).save(new UserAuthSession({ user }));

    return token;
  }

  public async verifyAuthToken(
    authToken: string,
    response: Response,
  ): Promise<User> {
    const rawTokenData = jwt.verify(
      authToken,
      EnvironmentVariables.JWT_SECRET,
    );

    const tokenDataValidationResult = z.object({
      data: z.object({
        sessionId: z.string().uuid(),
      }),
    }).safeParse(rawTokenData);

    if (!tokenDataValidationResult.success) {
      response.clearCookie('user-authentication-token')
      throw new UnauthorizedException();
    }

    const tokenData = tokenDataValidationResult.data;

    const session = await this.findSession(tokenData.data.sessionId);

    if (!session) {
      response.clearCookie('user-authentication-token')
      throw new UnauthorizedException();
    }

    const user = session.user;

    if (user.deletedAt) {
      response.clearCookie('user-authentication-token')
      throw new UnauthorizedException();
    }

    return user;
  }

  findSession(tokenString: string) {
    return this.tokensRepository.findOne({
      where: { id: tokenString },
    });
  }

  deleteSession(tokenString: string) {
    return this.tokensRepository.delete({
      id: tokenString,
    });
  }



  deleteAllSessionsFromUser(user: User) {
    return this.tokensRepository.delete({
      user,
    });
  }
}
