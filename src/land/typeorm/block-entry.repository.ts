import { SimpleEntityRepository } from 'src/internals/databases/simple-entity/simple-entity.repository';
import { EntityRepository } from 'typeorm';
import { BlockEntry } from './block-entry.entity';

@EntityRepository(BlockEntry)
export class BlockEntryRepository extends SimpleEntityRepository<
  BlockEntry,
  'createdAt'
> {}
