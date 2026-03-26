import { User } from 'src/users/user.entity';
import {
  AbstractRepository,
  EntityRepository,
  LessThan,
  MoreThan,
} from 'typeorm';
import { AuthToken } from './auth-token.entity';
import { v4 } from 'uuid';

@EntityRepository(AuthToken)
export class AuthTokensRepository extends AbstractRepository<AuthToken> {
  deleteExpired() {
    return this.repository.delete({
      expires: LessThan(new Date()),
    });
  }

  deleteToken(tokenString: string) {
    return this.repository.delete({
      id: tokenString,
    });
  }

  public async createToken(user: User, ttl: number): Promise<AuthToken> {
    const ttlInMilliseconds = ttl * 1000;

    const expiration = new Date();
    expiration.setTime(expiration.getTime() + ttlInMilliseconds);

    return this.repository.save(new AuthToken({
      httpOnlyKey: v4(),
      user,
      expires: expiration,
    }));
  }

  public findTokenById(id: string) {
    return this.repository.findOne({
      where: {
        id,
        expires: MoreThan(new Date()),
      },
    });
  }

  public findTokenByUser(user: User) {
    return this.repository.findOne({
      where: {
        user,
        expires: MoreThan(new Date()),
      },
    });
  }

  public deleteAllTokensFromUser(user: User) {
    return this.repository.delete({
      user,
    });
  }
}
