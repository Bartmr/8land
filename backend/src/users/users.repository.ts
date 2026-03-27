import {
  AbstractRepository,
  EntityRepository,
  FindOneOptions,
} from 'typeorm';
import { User } from './user.entity';

@EntityRepository(User)
export class UsersRepository extends AbstractRepository<User> {
  findOne(query: FindOneOptions<User>) {
    return this.repository.findOne(query);
  }

  create(entity: User): Promise<User> {
    return this.repository.save(entity);
  }

  async save(entity: User): Promise<void> {
    return this.saveMany([entity]);
  }

  async saveMany(entities: User[]): Promise<void> {
    await this.repository.save(entities);
  }
}
