import {
  AbstractRepository,
  EntityRepository,
  FindManyOptions,
  FindOneOptions,
} from 'typeorm';
import { Territory } from './territory.entity';

@EntityRepository(Territory)
export class TerritoriesRepository extends AbstractRepository<Territory> {
  findOne(query: FindOneOptions<Territory>) {
    return this.repository.findOne(query);
  }

  count(query: FindManyOptions<Territory>): Promise<number> {
    return this.repository.count(query);
  }

  create(entity: Territory): Promise<Territory> {
    return this.repository.save(entity);
  }

  async save(entity: Territory): Promise<void> {
    return this.saveMany([entity]);
  }

  async saveMany(entities: Territory[]): Promise<void> {
    await this.repository.save(
      entities
    );
  }
}
