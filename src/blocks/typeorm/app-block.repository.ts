import { SimpleEntityRepository } from 'src/internals/databases/simple-entity/simple-entity.repository';
import { EntityRepository } from 'typeorm';
import { AppBlock } from './app-block.entity';

@EntityRepository(AppBlock)
export class AppBlockRepository extends SimpleEntityRepository<AppBlock> {
  remove(entity: AppBlock) {
    return this.repository.remove(entity);
  }
}
