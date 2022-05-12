import { SimpleEntityRepository } from 'src/internals/databases/simple-entity/simple-entity.repository';
import { TrainState } from 'src/users/typeorm/train-state.entity';
import { EntityManager, EntityRepository } from 'typeorm';
import { Land } from './land.entity';

@EntityRepository(Land)
export class LandRepository extends SimpleEntityRepository<
  Land,
  'createdAt' | 'updatedAt'
> {
  remove(entity: Land) {
    const run = async (manager: EntityManager) => {
      const trainStateRepository = manager.getRepository(TrainState);

      await trainStateRepository
        .createQueryBuilder()
        .update()
        .set({
          boardedIn: null,
          destinationLand: null,
        })
        .where('boardedIn = :boardedInId', { boardedInId: entity.id })
        .orWhere('destinationLand = :destinationLandId', {
          destinationLandId: entity.id,
        })
        .execute();

      await this.repository.remove(entity);
    };

    if (this.manager.queryRunner?.isTransactionActive) {
      return run(this.manager);
    } else {
      return this.manager.transaction(run);
    }
  }
}
