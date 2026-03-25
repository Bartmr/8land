import { SimpleEntityRepository } from 'src/internals/databases/simple-entity/simple-entity.repository';
import { NavigationState } from 'src/users/typeorm/navigation-state.entity';
import { EntityManager, EntityRepository } from 'typeorm';
import { DoorBlock } from './door-block.entity';

@EntityRepository(DoorBlock)
export class DoorBlockRepository extends SimpleEntityRepository<DoorBlock> {
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
