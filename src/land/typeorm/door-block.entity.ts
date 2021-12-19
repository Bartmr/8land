import { SimpleEntity } from 'src/internals/databases/simple-entity/simple.entity';
import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  UpdateDateColumn,
} from 'typeorm';
import { Land } from './land.entity';

@Entity()
export class DoorBlock extends SimpleEntity {
  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne(() => Land, { eager: true })
  @JoinColumn()
  landA!: Land;

  @ManyToOne(() => Land, { eager: true })
  @JoinColumn()
  landB!: Land;
}
