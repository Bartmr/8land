import { AppBlock } from 'src/blocks/app-block.entity';
import { DoorBlock } from 'src/blocks/door-block.entity';
import { World } from 'src/worlds/worlds.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
@Unique(['searchableName'])
export class Land {
  @PrimaryGeneratedColumn('uuid')
  id!: string;
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

  @ManyToOne(() => World, (e) => e.lands, { eager: true })
  world!: World | null;

  @Column('bool', { nullable: true })
  isStartingLand!: null | boolean;

  @Column('bool', { nullable: true })
  isTrainStation!: null | boolean;

  constructor(props: {
    name: string;
    searchableName: string;
    backgroundMusicUrl: string | null;
    hasAssets: boolean | null;
    doorBlocks: Promise<DoorBlock[]>;
    doorBlocksReferencing: Promise<DoorBlock[]>;
    appBlocks: Promise<AppBlock[]>;
    world: World | null;
    isStartingLand: boolean | null;
    isTrainStation: boolean | null;
  })
  constructor()
  constructor(props?: {
    name: string;
    searchableName: string;
    backgroundMusicUrl: string | null;
    hasAssets: boolean | null;
    doorBlocks: Promise<DoorBlock[]>;
    doorBlocksReferencing: Promise<DoorBlock[]>;
    appBlocks: Promise<AppBlock[]>;
    world: World | null;
    isStartingLand: boolean | null;
    isTrainStation: boolean | null;
  }) {
    if (props) {
      this.name = props.name;
      this.searchableName = props.searchableName;
      this.backgroundMusicUrl = props.backgroundMusicUrl;
      this.hasAssets = props.hasAssets;
      this.doorBlocks = props.doorBlocks;
      this.doorBlocksReferencing = props.doorBlocksReferencing;
      this.appBlocks = props.appBlocks;
      this.world = props.world;
      this.isStartingLand = props.isStartingLand;
      this.isTrainStation = props.isTrainStation;
    }
  }
}
