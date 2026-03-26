import { Class } from '@shared/src/types/classes-types';
import {
  AbstractRepository,
  DeepPartial,
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
    const EntityClass = this.repository.target as Class;

    for (const entity of entities) {
      if (!(entity instanceof EntityClass)) {
        throw new Error();
      }
    }

    await this.repository.save(entities as unknown as DeepPartial<User>[]);
  }
}
