import { SimpleEntity } from 'src/internals/databases/simple-entity/simple.entity';
import { Land } from 'src/land/typeorm/land.entity';
import { Territory } from 'src/territories/typeorm/territory.entity';
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

  @ManyToOne(() => Land, { nullable: true })
  @JoinColumn()
  land?: Land | null;

  @ManyToOne(() => Territory, { nullable: true })
  @JoinColumn()
  territory!: Territory | null;

  @OneToOne(() => DoorBlock, { nullable: true, eager: true })
  @JoinColumn()
  door!: DoorBlock | null;
}
