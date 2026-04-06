import { AppBlock } from 'src/blocks/app-block.entity';
import { DoorBlock } from 'src/blocks/door-block.entity';
import { Land } from 'src/land/land.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Territory {
  @PrimaryGeneratedColumn('uuid')
  id!: string;
  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column('boolean', { nullable: true })
  hasAssets!: boolean | null;

  @Column()
  startX!: number;

  @Column()
  startY!: number;

  @Column()
  endX!: number;

  @Column()
  endY!: number;

  @ManyToOne(() => Land, (e) => e.territories, { lazy: true })
  @JoinColumn()
  inLand!: Promise<Land>;

  @OneToMany(() => DoorBlock, (e) => e.inTerritory, { eager: true })
  doorBlocks!: DoorBlock[];

  @OneToMany(() => AppBlock, (e) => e.inTerritory, { eager: true })
  appBlocks!: AppBlock[];

 

  constructor(props: {
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    hasAssets: boolean | null;
    inLand: Promise<Land>;
    doorBlocks: DoorBlock[];
    appBlocks: AppBlock[];
  })
  constructor()
  constructor(props?: {
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    hasAssets: boolean | null;
    inLand: Promise<Land>;
    doorBlocks: DoorBlock[];
    appBlocks: AppBlock[];
    
  }) {
    if (props) {
      this.startX = props.startX;
      this.startY = props.startY;
      this.endX = props.endX;
      this.endY = props.endY;
      this.hasAssets = props.hasAssets;
      this.inLand = props.inLand;
      this.doorBlocks = props.doorBlocks;
      this.appBlocks = props.appBlocks;
    }
  }
}
