import { User } from 'src/users/user.entity';
import {
  AbstractRepository,
  EntityRepository,
  LessThan,
  MoreThan,
} from 'typeorm';
import { UserAuthSession } from './auth-session.entity';
import { v4 } from 'uuid';

@EntityRepository(UserAuthSession)
export class AuthSessionsRepository extends AbstractRepository<UserAuthSession> {


  deleteSession(tokenString: string) {
    return this.repository.delete({
      id: tokenString,
    });
  }

  public async createSession(user: User): Promise<UserAuthSession> {


    return this.repository.save(new UserAuthSession({
      user,
    }));
  }

  public findSessionById(id: string) {
    return this.repository.findOne({
      where: {
        id,
      },
    });
  }

  public findSessionByUser(user: User) {
    return this.repository.findOne({
      where: {
        user,
      },
    });
  }

  public deleteAllSessionsFromUser(user: User) {
    return this.repository.delete({
      user,
    });
  }
}
