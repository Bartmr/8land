import { BlockEntry } from 'src/blocks/typeorm/block-entry.entity';
import { SimpleEntity } from 'src/internals/databases/simple-entity/simple.entity';
import { Land } from 'src/land/typeorm/land.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Territory extends SimpleEntity {
  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column('boolean', { nullable: true })
  hasAssets!: boolean | null;

  @ManyToOne(() => Land, (e) => e.territories, { lazy: true })
  @JoinColumn()
  inLand!: Promise<Land>;

  @Column()
  startX!: number;

  @Column()
  startY!: number;

  @Column()
  endX!: number;

  @Column()
  endY!: number;

  @OneToMany(() => BlockEntry, (e) => e.territory, { lazy: true })
  blocks!: Promise<BlockEntry[]>;
}
