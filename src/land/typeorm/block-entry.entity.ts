import { SimpleEntity } from 'src/internals/databases/simple-entity/simple.entity';
import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
} from 'typeorm';
import { DoorBlock } from './door-block.entity';
import { Land } from './land.entity';

@Entity()
export class BlockEntry extends SimpleEntity {
  @CreateDateColumn()
  createdAt!: Date;

  @ManyToOne(() => Land, { nullable: false })
  @JoinColumn()
  land!: Land;

  @OneToOne(() => DoorBlock, { nullable: true, eager: true })
  @JoinColumn()
  door?: DoorBlock;
}
