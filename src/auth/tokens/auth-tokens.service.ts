import {
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { EnvironmentVariablesService } from 'src/internals/environment/environment-variables.service';
import { User } from 'src/users/typeorm/user.entity';
import { AuthTokensRepository } from './auth-token.repository';
import { Connection, EntityManager } from 'typeorm';
import { LoggingService } from 'src/internals/logging/logging.service';
import { cleanExpiredAuthTokens } from './clean-expired-auth-tokens';
import { throwError } from 'src/internals/utils/throw-error';
import { ProcessContextManager } from 'src/internals/process/process-context-manager';

@Injectable()
export class AuthTokensService implements OnModuleInit, OnModuleDestroy {
  private loggingService: LoggingService;
  private tokensRepository: AuthTokensRepository;
  private tokensCleanupInterval?: NodeJS.Timer;

  constructor(
    loggingService: LoggingService,
    @InjectConnection() connection: Connection,
  ) {
    this.loggingService = loggingService;
    this.tokensRepository =
      connection.getCustomRepository(AuthTokensRepository);
  }

  onModuleInit() {
    if (ProcessContextManager.getContext().isMasterWorker) {
      this.tokensCleanupInterval = setInterval(() => {
        cleanExpiredAuthTokens().catch((err) => {
          this.loggingService.logError(
            'auth-tokens-service:token-cleanup-error',
            err,
          );
        });
      }, 1000 * 60 * 60);
    }
  }

  onModuleDestroy() {
    if (ProcessContextManager.getContext().isMasterWorker) {
      clearInterval(this.tokensCleanupInterval ?? throwError());
    }
  }

  async createAuthToken(manager: EntityManager, user: User) {
    const tokensRepository = manager.getCustomRepository(AuthTokensRepository);

    const ttl = EnvironmentVariablesService.variables.AUTH_TOKEN_TTL;

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
}
