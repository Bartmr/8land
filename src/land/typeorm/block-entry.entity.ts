import { SimpleEntity } from 'src/internals/databases/simple-entity/simple.entity';
import { Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Land } from './land.entity';

@Entity()
export class BlockEntry extends SimpleEntity {
  @ManyToOne(() => Land, { nullable: false })
  @JoinColumn()
  land!: Land;
}
