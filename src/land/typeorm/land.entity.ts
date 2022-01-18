import { SimpleEntity } from 'src/internals/databases/simple-entity/simple.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { BlockEntry } from '../../blocks/typeorm/block-entry.entity';

@Entity()
@Unique(['searchableName'])
export class Land extends SimpleEntity {
  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column('text')
  name!: string;

  @Column('text')
  searchableName!: string;

  @OneToMany(() => BlockEntry, (e) => e.land, { lazy: true })
  blocks!: Promise<BlockEntry[]>;

  @Column('text', { nullable: true })
  backgroundMusicUrl!: string | null;

  @Column('boolean', { nullable: true })
  hasAssets!: boolean | null;

  // TODO: territory relationship nullable column
}
