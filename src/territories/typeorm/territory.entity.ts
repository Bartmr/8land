import { AppBlock } from 'src/blocks/typeorm/app-block.entity';
import { DoorBlock } from 'src/blocks/typeorm/door-block.entity';
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

  @Column('text', { nullable: true })
  tokenAddress!: string | null;

  @Column('text', { nullable: true })
  tokenId!: string | null;
}
