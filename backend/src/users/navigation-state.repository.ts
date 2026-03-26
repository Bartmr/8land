import { Class } from '@shared/src/types/classes-types';
import {
  AbstractRepository,
  DeepPartial,
  EntityRepository,
} from 'typeorm';
import { NavigationState } from './navigation-state.entity';
import { User } from './user.entity';

@EntityRepository(NavigationState)
export class NavigationStateRepository extends AbstractRepository<NavigationState> {
  async getNavigationStateFromUser(user: User) {
    const state = await this.repository.findOne({
      where: {
        user,
      },
    });

    if (!state) {
      const entity = this.repository.create({ user: Promise.resolve(user) });
      return this.repository.save(entity);
    } else {
      return state;
    }
  }

  async save(entity: NavigationState): Promise<void> {
    return this.saveMany([entity]);
  }

  async saveMany(entities: NavigationState[]): Promise<void> {
    const EntityClass = this.repository.target as Class;

    for (const entity of entities) {
      if (!(entity instanceof EntityClass)) {
        throw new Error();
      }
    }

    await this.repository.save(
      entities as unknown as DeepPartial<NavigationState>[],
    );
  }
}
