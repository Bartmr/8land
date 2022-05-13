import { AppBlock } from 'src/blocks/typeorm/app-block.entity';
import { DoorBlock } from 'src/blocks/typeorm/door-block.entity';
import { SimpleEntity } from 'src/internals/databases/simple-entity/simple.entity';
import { Territory } from 'src/territories/typeorm/territory.entity';
import { World } from 'src/worlds/typeorm/worlds.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
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

  @OneToMany(() => Territory, (e) => e.inLand, { lazy: true })
  territories!: Promise<Territory[]>;

  @OneToMany(() => AppBlock, (b) => b.inLand, { eager: true })
  appBlocks!: AppBlock[];

  @ManyToOne(() => World, (e) => e.lands, { eager: true })
  world!: World | null;

  /*
    TODO:
    this value is set after examining the JSON map.

    If the JSON map includes a "start" tile, and it's placed in the map, the land will be set a starting land.

    when the land is a starting land, it cannot be deleted, and the map must always have a "start" tile placed in it
  */
  /*
    Once you upload a land block with a start block, you can never delete it
    or change it without a start block in its map
  */
  @Column('bool', { nullable: true })
  isStartingLand!: null | boolean;
}
