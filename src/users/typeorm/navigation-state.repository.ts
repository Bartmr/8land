import { AuditContext } from 'src/internals/auditing/audit-context';
import { SimpleEntityRepository } from 'src/internals/databases/simple-entity/simple-entity.repository';
import { EntityManager, EntityRepository } from 'typeorm';
import { NavigationState } from './navigation-state.entity';
import { User } from './user.entity';

@EntityRepository(NavigationState)
export class NavigationStateRepository extends SimpleEntityRepository<
  NavigationState,
  | 'lastDoor'
  | 'isComingBack'
  | 'lastPlayedBackgroundMusicUrl'
  | 'lastCheckpointWasDeleted'
  | 'traveledByTrainToLand'
  | 'boardedOnTrainStation'
> {
  async getNavigationStateFromUser(
    user: User,
    {
      eM,
      auditContext,
    }: {
      auditContext: AuditContext;
      eM?: EntityManager;
    },
  ) {
    const repository = eM
      ? eM.getCustomRepository(NavigationStateRepository)
      : this;

    const state = await repository.findOne({
      where: {
        user,
      },
    });

    if (!state) {
      const res = await repository.create(
        {
          user: Promise.resolve(user),
        },
        auditContext,
      );

      return res;
    } else {
      return state;
    }
  }
}
