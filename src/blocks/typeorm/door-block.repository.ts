import { SimpleEntityRepository } from 'src/internals/databases/simple-entity/simple-entity.repository';
import { EntityRepository } from 'typeorm-bartmr';
import { DoorBlock } from './door-block.entity';

@EntityRepository(DoorBlock)
export class DoorBlockRepository extends SimpleEntityRepository<DoorBlock> {
  remove(entity: DoorBlock) {
    return this.repository.remove(entity);
  }
}
