import { SimpleEntity } from 'src/internals/databases/simple-entity/simple.entity';
import { Land } from 'src/land/typeorm/land.entity';
import { Territory } from 'src/territories/typeorm/territory.entity';
import { Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity()
export class DoorBlock extends SimpleEntity {
  @ManyToOne(() => Land, { eager: true, nullable: true })
  @JoinColumn()
  inLand!: Land | null;

  @ManyToOne(() => Territory, { lazy: true, nullable: true })
  @JoinColumn()
  inTerritory!: Promise<Territory | null>;

  @ManyToOne(() => Land, { eager: true })
  @JoinColumn()
  toLand!: Land;
}
