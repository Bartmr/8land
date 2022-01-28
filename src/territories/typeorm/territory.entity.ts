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
} from 'typeorm-bartmr';

@Entity()
export class Territory extends SimpleEntity {
  @Column('text', { nullable: true })
  nftTransactionHash!: string | null;

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
}
