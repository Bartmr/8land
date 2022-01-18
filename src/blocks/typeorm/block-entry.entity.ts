import { SimpleEntity } from 'src/internals/databases/simple-entity/simple.entity';
import { Land } from 'src/land/typeorm/land.entity';
import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
} from 'typeorm';
import { DoorBlock } from './door-block.entity';

@Entity()
export class BlockEntry extends SimpleEntity {
  @CreateDateColumn()
  createdAt!: Date;

  @ManyToOne(() => Land)
  @JoinColumn()
  land!: Land;

  @OneToOne(() => DoorBlock, { nullable: true, eager: true })
  @JoinColumn()
  door!: DoorBlock | null;
}
