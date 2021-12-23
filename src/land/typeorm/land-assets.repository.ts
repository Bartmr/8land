import { SimpleEntityRepository } from 'src/internals/databases/simple-entity/simple-entity.repository';
import { EntityRepository } from 'typeorm';
import { LandAssets } from './land-assets.entity';

@EntityRepository(LandAssets)
export class LandAssetsRepository extends SimpleEntityRepository<LandAssets> {}
