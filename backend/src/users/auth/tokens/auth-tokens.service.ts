import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from 'src/users/user.entity';
import { AuthTokensRepository } from './auth-token.repository';
import { DataSource, EntityManager } from 'typeorm';
import { cleanExpiredAuthTokens } from './clean-expired-auth-tokens';
import { throwError } from 'src/throw-error';

@Injectable()
export class AuthTokensService implements OnModuleInit, OnModuleDestroy {
  private logger: Logger = new Logger(AuthTokensRepository.name)
  private tokensRepository: AuthTokensRepository;
  private tokensCleanupInterval?: NodeJS.Timeout;

  constructor(
    dataSource: DataSource,
  ) {
    this.tokensRepository =
      dataSource.getCustomRepository(AuthTokensRepository);
  }

  onModuleInit() {
    this.tokensCleanupInterval = setInterval(() => {
      cleanExpiredAuthTokens().catch((err) => {
        this.logger.error(
          'auth-tokens-service:token-cleanup-error',
          err,
        );
      });
    }, 1000 * 60 * 60);
  }

  onModuleDestroy() {
    clearInterval(this.tokensCleanupInterval ?? throwError());
  }

  async createAuthToken(manager: EntityManager, user: User) {
    const tokensRepository = manager.getCustomRepository(AuthTokensRepository);

    const ttl = 60 * 60 * 24 * 30;

    const token = await tokensRepository.createToken(user, ttl);

    return token;
  }

  public async validateAuthToken(
    authTokenId: string,
    httpOnlyAuthTokenKey: string,
  ): Promise<User> {
    const authToken = await this.findToken(authTokenId);

    if (!authToken) {
      throw new UnauthorizedException();
    }

    if (authToken.httpOnlyKey !== httpOnlyAuthTokenKey) {
      throw new UnauthorizedException();
    }

    const user = authToken.user;

    if (user.deletedAt) {
      throw new UnauthorizedException();
    }

    return user;
  }

  deleteToken(tokenString: string) {
    return this.tokensRepository.deleteToken(tokenString);
  }

  findToken(tokenString: string) {
    return this.tokensRepository.findTokenById(tokenString);
  }

  deleteAllTokensFromUser(user: User) {
    return this.tokensRepository.deleteAllTokensFromUser(user);
  }
}
