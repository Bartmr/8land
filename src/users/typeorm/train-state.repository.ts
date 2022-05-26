import { AuditContext } from 'src/internals/auditing/audit-context';
import { SimpleEntityRepository } from 'src/internals/databases/simple-entity/simple-entity.repository';
import { EntityManager, EntityRepository } from 'typeorm';
import { TrainState } from './train-state.entity';
import { User } from './user.entity';

@EntityRepository(TrainState)
export class TrainStateRepository extends SimpleEntityRepository<
  TrainState,
  'boardedIn'
> {
  async getTrainStateFromUser(
    user: User,
    {
      eM,
      auditContext,
    }: {
      auditContext: AuditContext;
      eM?: EntityManager;
    },
  ) {
    const repository = eM ? eM.getCustomRepository(TrainStateRepository) : this;

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
