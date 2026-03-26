import { AbstractRepository, EntityRepository } from 'typeorm';
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
}
