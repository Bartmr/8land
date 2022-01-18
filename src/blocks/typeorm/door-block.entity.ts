import { SimpleEntity } from 'src/internals/databases/simple-entity/simple.entity';
import { Land } from 'src/land/typeorm/land.entity';
import { Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity()
export class DoorBlock extends SimpleEntity {
  @ManyToOne(() => Land, { eager: true })
  @JoinColumn()
  toLand!: Land;
}
