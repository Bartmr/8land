import { SimpleEntityRepository } from 'src/internals/databases/simple-entity/simple-entity.repository';
import { NavigationState } from 'src/users/typeorm/navigation-state.entity';
import { TrainState } from 'src/users/typeorm/train-state.entity';
import { EntityManager, EntityRepository } from 'typeorm';
import { Land } from './land.entity';

@EntityRepository(Land)
export class LandRepository extends SimpleEntityRepository<
  Land,
  'createdAt' | 'updatedAt'
> {
  remove(
    entity: Land,
  ): Promise<{ status: 'cannot-delete-start-land' } | { status: 'ok' }> {
    const run = async (manager: EntityManager) => {
      if (entity.isStartingLand) {
        return { status: 'cannot-delete-start-land' } as const;
      }

      const trainStateRepository = manager.getRepository(TrainState);
      const navigationStateRepository = manager.getRepository(NavigationState);

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

      await navigationStateRepository
        .createQueryBuilder()
        .update()
        .set({
          traveledByTrainToLand: null
        })
        .where('traveledByTrainToLand = :traveledByTrainToLandId', { traveledByTrainToLandId: entity.id })
        .execute();
      
      await navigationStateRepository
        .createQueryBuilder()
        .update()
        .set({
          boardedOnTrainStation: null
        })
        .where('boardedOnTrainStation = :boardedOnTrainStationId', { boardedOnTrainStationId: entity.id })
        .execute();

      await this.repository.remove(entity);

      return { status: 'ok' } as const;
    };

    if (this.manager.queryRunner?.isTransactionActive) {
      return run(this.manager);
    } else {
      return this.manager.transaction(run);
    }
  }
}
