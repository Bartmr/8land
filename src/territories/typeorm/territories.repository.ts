import { SimpleEntityRepository } from 'src/internals/databases/simple-entity/simple-entity.repository';
import { EntityRepository } from 'typeorm';
import { Territory } from './territory.entity';

@EntityRepository(Territory)
export class TerritoriesRepository extends SimpleEntityRepository<
  Territory,
  'createdAt' | 'updatedAt'
> {}
