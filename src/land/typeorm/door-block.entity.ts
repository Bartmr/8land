import { SimpleEntity } from 'src/internals/databases/simple-entity/simple.entity';
import { Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Land } from './land.entity';

@Entity()
export class DoorBlock extends SimpleEntity {
  @ManyToOne(() => Land, { eager: true })
  @JoinColumn()
  toLand!: Land;
}
