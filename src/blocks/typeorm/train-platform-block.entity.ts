import { SimpleEntity } from 'src/internals/databases/simple-entity/simple.entity';
import { Land } from 'src/land/typeorm/land.entity';
import { Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity()
export class TrainPlatformBlock extends SimpleEntity {
  @ManyToOne(() => Land, { lazy: true, nullable: true })
  @JoinColumn()
  inLand!: Promise<Land | null>;
}
