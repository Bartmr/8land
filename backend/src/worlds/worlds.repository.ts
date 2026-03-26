import { AbstractRepository, EntityRepository } from 'typeorm';
import { World } from './worlds.entity';

@EntityRepository(World)
export class WorldRepository extends AbstractRepository<World> {}
