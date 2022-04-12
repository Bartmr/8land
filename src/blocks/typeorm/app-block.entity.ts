import { SimpleEntity } from 'src/internals/databases/simple-entity/simple.entity';
import { Land } from 'src/land/typeorm/land.entity';
import { Territory } from 'src/territories/typeorm/territory.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity()
export class AppBlock extends SimpleEntity {
  @ManyToOne(() => Land, { lazy: true, nullable: true })
  @JoinColumn()
  inLand!: Promise<Land | null>;

  @ManyToOne(() => Territory, { lazy: true, nullable: true })
  @JoinColumn()
  inTerritory!: Promise<Territory | null>;

  @Column('text')
  url!: string;
}
