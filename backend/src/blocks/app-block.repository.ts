import {
  AbstractRepository,
  EntityRepository,
  FindOneOptions,
} from 'typeorm';
import { AppBlock } from './app-block.entity';

@EntityRepository(AppBlock)
export class AppBlockRepository extends AbstractRepository<AppBlock> {
  findOne(query: FindOneOptions<AppBlock>) {
    return this.repository.findOne(query);
  }

  create(entity: AppBlock): Promise<AppBlock> {
    return this.repository.save(entity);
  }

  remove(entity: AppBlock) {
    return this.repository.remove(entity);
  }
}
