import { Class } from '@shared/src/types/classes-types';
import {
  AbstractRepository,
  DeepPartial,
  EntityRepository,
  FindOneOptions,
} from 'typeorm';
import { World } from './worlds.entity';

@EntityRepository(World)
export class WorldRepository extends AbstractRepository<World> {
  findOne(query: FindOneOptions<World>) {
    return this.repository.findOne(query);
  }

  create(entity: World): Promise<World> {
    return this.repository.save(entity);
  }

  async save(entity: World): Promise<void> {
    return this.saveMany([entity]);
  }

  async saveMany(entities: World[]): Promise<void> {
    const EntityClass = this.repository.target as Class;

    for (const entity of entities) {
      if (!(entity instanceof EntityClass)) {
        throw new Error();
      }
    }

    await this.repository.save(entities as unknown as DeepPartial<World>[]);
  }
}
