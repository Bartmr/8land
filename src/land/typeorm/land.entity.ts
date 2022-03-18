import { AppBlock } from 'src/blocks/typeorm/app-block.entity';
import { DoorBlock } from 'src/blocks/typeorm/door-block.entity';
import { SimpleEntity } from 'src/internals/databases/simple-entity/simple.entity';
import { Territory } from 'src/territories/typeorm/territory.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

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

  @Column('text', { nullable: true })
  backgroundMusicUrl!: string | null;

  @Column('boolean', { nullable: true })
  hasAssets!: boolean | null;

  @OneToMany(() => DoorBlock, (b) => b.inLand, { lazy: true })
  doorBlocks!: Promise<DoorBlock[]>;

  @OneToMany(() => DoorBlock, (b) => b.toLand, { lazy: true })
  doorBlocksReferencing!: Promise<DoorBlock[]>;

  @OneToMany(() => AppBlock, (b) => b.inLand, { lazy: true })
  appBlocks!: Promise<AppBlock[]>;

  @OneToMany(() => Territory, (e) => e.inLand, { lazy: true })
  territories!: Promise<Territory[]>;

  // TODO: territory relationship nullable column, when land is indoors of territory
}
