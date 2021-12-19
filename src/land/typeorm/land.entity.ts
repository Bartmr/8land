import { SimpleEntity } from 'src/internals/databases/simple-entity/simple.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  UpdateDateColumn,
} from 'typeorm';
import { BlockEntry } from './block-entry.entity';
import { LandAssets } from './land-assets.entity';

@Entity()
export class Land extends SimpleEntity {
  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToOne(() => LandAssets, { nullable: true, eager: true })
  @JoinColumn()
  assets?: LandAssets;

  @Column('text')
  name!: string;

  @OneToMany(() => BlockEntry, (e) => e.land, { eager: true })
  blocks!: BlockEntry[];
}
