import { SimpleEntityRepository } from 'src/internals/databases/simple-entity/simple-entity.repository';
import { EntityRepository } from 'typeorm';
import { Land } from './land.entity';

@EntityRepository(Land)
export class LandRepository extends SimpleEntityRepository<
  Land,
  'createdAt' | 'updatedAt'
> {}
