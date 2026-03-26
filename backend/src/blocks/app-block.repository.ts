import { AbstractRepository, EntityRepository } from 'typeorm';
import { AppBlock } from './app-block.entity';

@EntityRepository(AppBlock)
export class AppBlockRepository extends AbstractRepository<AppBlock> {
  remove(entity: AppBlock) {
    return this.repository.remove(entity);
  }
}
