import { NavigationState } from 'src/users/navigation-state.entity';
import { AbstractRepository, EntityManager, EntityRepository } from 'typeorm';
import { DoorBlock } from './door-block.entity';

@EntityRepository(DoorBlock)
export class DoorBlockRepository extends AbstractRepository<DoorBlock> {
  remove(entity: DoorBlock) {
    const run = async (manager: EntityManager) => {
      const doorsRepository = manager.getRepository(DoorBlock);
      const navigationStateRepositories =
        manager.getRepository(NavigationState);

      await navigationStateRepositories.update(
        {
          lastDoor: entity,
        },
        {
          lastDoor: null,
          cameBack: null,
          lastPlayedBackgroundMusicUrl: null,
          lastCheckpointWasDeleted: true,
        },
      );

      await doorsRepository.remove(entity);
    };

    if (this.manager.queryRunner?.isTransactionActive) {
      return run(this.manager);
    } else {
      return this.manager.transaction(run);
    }
  }
}
