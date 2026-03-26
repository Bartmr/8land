import { NavigationState } from 'src/users/navigation-state.entity';
import { AbstractRepository, EntityManager, EntityRepository } from 'typeorm';
import { Land } from './land.entity';

@EntityRepository(Land)
export class LandRepository extends AbstractRepository<Land> {
  remove(entity: Land) {
    const run = async (manager: EntityManager) => {
      const navigationStateRepository = manager.getRepository(NavigationState);

      await navigationStateRepository
        .createQueryBuilder()
        .update()
        .set({
          traveledByTrainToLand: null,
          lastCheckpointWasDeleted: true,
        })
        .where('traveledByTrainToLand = :traveledByTrainToLandId', {
          traveledByTrainToLandId: entity.id,
        })
        .execute();

      await navigationStateRepository
        .createQueryBuilder()
        .update()
        .set({
          traveledByTrainToLand: null,
          boardedOnTrainStation: null,
          lastCheckpointWasDeleted: true,
        })
        .where('boardedOnTrainStation = :boardedOnTrainStationId', {
          boardedOnTrainStationId: entity.id,
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
