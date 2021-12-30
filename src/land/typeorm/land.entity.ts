import { SimpleEntity } from 'src/internals/databases/simple-entity/simple.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { BlockEntry } from './block-entry.entity';
import { LandAssets } from './land-assets.entity';

@Entity()
@Unique(['searchableName'])
export class Land extends SimpleEntity {
  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToOne(() => LandAssets, { nullable: true, eager: true })
  @JoinColumn()
  assets!: LandAssets | null;

  @Column('text')
  name!: string;

  @Column('text')
  searchableName!: string;

  @OneToMany(() => BlockEntry, (e) => e.land, { lazy: true })
  blocks!: Promise<BlockEntry[]>;

  @Column('text', { nullable: true })
  backgroundMusicUrl!: string | null;

  // TODO: territory relationship nullable column
}
