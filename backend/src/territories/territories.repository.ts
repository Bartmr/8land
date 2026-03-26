import { AbstractRepository, EntityRepository } from 'typeorm';
import { Territory } from './territory.entity';

@EntityRepository(Territory)
export class TerritoriesRepository extends AbstractRepository<Territory> {}
