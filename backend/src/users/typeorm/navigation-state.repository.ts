import { AuditContext } from 'src/internals/auditing/audit-context';
import { SimpleEntityRepository } from 'src/internals/databases/simple-entity/simple-entity.repository';
import { EntityRepository } from 'typeorm';
import { NavigationState } from './navigation-state.entity';
import { User } from './user.entity';

@EntityRepository(NavigationState)
export class NavigationStateRepository extends SimpleEntityRepository<
  NavigationState,
  | 'lastDoor'
  | 'cameBack'
  | 'lastPlayedBackgroundMusicUrl'
  | 'lastCheckpointWasDeleted'
  | 'traveledByTrainToLand'
  | 'boardedOnTrainStation'
> {
  async getNavigationStateFromUser(
    user: User,
    {
      auditContext,
    }: {
      auditContext: AuditContext;
    },
  ) {
    const state = await this.findOne({
      where: {
        user,
      },
    });

    if (!state) {
      const res = await this.create(
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
