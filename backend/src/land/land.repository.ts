import { Class } from '@shared/src/types/classes-types';
import { NavigationState } from 'src/users/navigation-state.entity';
import {
  AbstractRepository,
  DeepPartial,
  EntityManager,
  EntityRepository,
  FindManyOptions,
  FindOneOptions,
  SelectQueryBuilder,
} from 'typeorm';
import { Land } from './land.entity';

@EntityRepository(Land)
export class LandRepository extends AbstractRepository<Land> {
  findOne(query: FindOneOptions<Land>) {
    return this.repository.findOne(query);
  }

  count(query: FindManyOptions<Land>): Promise<number> {
    return this.repository.count(query);
  }

  create(entity: Land): Promise<Land> {
    return this.repository.save(entity);
  }

  async save(entity: Land): Promise<void> {
    return this.saveMany([entity]);
  }

  async saveMany(entities: Land[]): Promise<void> {
    const EntityClass = this.repository.target as Class;

    for (const entity of entities) {
      if (!(entity instanceof EntityClass)) {
        throw new Error();
      }
    }

    await this.repository.save(entities as unknown as DeepPartial<Land>[]);
  }

  async selectManyAndCount(
    options: { alias: string; skip: number },
    builderFn: (
      queryBuilder: SelectQueryBuilder<Land>,
    ) => SelectQueryBuilder<Land>,
  ) {
    const limit = 50;

    let queryBuilder = this.repository.createQueryBuilder(options.alias);

    queryBuilder = builderFn(queryBuilder);

    queryBuilder = this.joinEagerRelations(queryBuilder, {
      alias: options.alias,
    });

    queryBuilder = queryBuilder.skip(options.skip).take(limit);

    const results = await queryBuilder.getManyAndCount();

    return {
      limit,
      rows: results[0],
      total: results[1],
    };
  }

  async selectAndCount(
    options: { alias: string },
    builderFn: (
      queryBuilder: SelectQueryBuilder<Land>,
    ) => SelectQueryBuilder<Land>,
  ) {
    let queryBuilder = this.repository.createQueryBuilder(options.alias);

    queryBuilder = builderFn(queryBuilder);

    return queryBuilder.getCount();
  }

  async selectOne(
    options: { alias: string },
    builderFn: (
      queryBuilder: SelectQueryBuilder<Land>,
    ) => SelectQueryBuilder<Land>,
  ) {
    let queryBuilder = this.repository.createQueryBuilder(options.alias);

    queryBuilder = builderFn(queryBuilder);

    queryBuilder = this.joinEagerRelations(queryBuilder, {
      alias: options.alias,
    });

    return queryBuilder.getOne();
  }

  remove(entity: Land) {
    const run = async (manager: EntityManager) => {
      const navigationStateRepository = manager.getRepository(NavigationState);

      await navigationStateRepository
        .createQueryBuilder()
        .update()
        .set({
          traveledByTrainToLand: null,
          lastCheckpointWasDeleted: true,
        })
        .where('traveledByTrainToLand = :traveledByTrainToLandId', {
          traveledByTrainToLandId: entity.id,
        })
        .execute();

      await navigationStateRepository
        .createQueryBuilder()
        .update()
        .set({
          traveledByTrainToLand: null,
          boardedOnTrainStation: null,
          lastCheckpointWasDeleted: true,
        })
        .where('boardedOnTrainStation = :boardedOnTrainStationId', {
          boardedOnTrainStationId: entity.id,
        })
        .execute();

      await this.repository.remove(entity);
    };

    if (this.manager.queryRunner?.isTransactionActive) {
      return run(this.manager);
    } else {
      return this.manager.transaction(run);
    }
  }

  private joinEagerRelations(
    queryBuilder: SelectQueryBuilder<Land>,
    options: { alias: string },
  ) {
    let _queryBuilder = queryBuilder;

    const alreadyJoinedProperties: string[] = [];

    for (const join of _queryBuilder.expressionMap.joinAttributes) {
      if (join.relation) {
        alreadyJoinedProperties.push(join.relation.propertyName);
      }
    }

    const eagerRelations = this.repository.metadata.eagerRelations;

    for (const relation of eagerRelations) {
      if (alreadyJoinedProperties.includes(relation.propertyName)) {
        continue;
      }

      _queryBuilder = _queryBuilder.leftJoinAndSelect(
        `${options.alias}.${relation.propertyName}`,
        relation.propertyName,
      );
    }

    return _queryBuilder;
  }
}
