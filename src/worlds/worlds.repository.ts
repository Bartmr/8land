import { SimpleEntityRepository } from 'src/internals/databases/simple-entity/simple-entity.repository';
import { EntityRepository } from 'typeorm';
import { World } from './typeorm/worlds.entity';

@EntityRepository(World)
export class WorldRepository extends SimpleEntityRepository<
  World,
  'createdAt' | 'hasStartLand'
> {}
