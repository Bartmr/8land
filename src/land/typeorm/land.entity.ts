import { SimpleEntity } from 'src/internals/databases/simple-entity/simple.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  UpdateDateColumn,
} from 'typeorm';
import { LandAssets } from './land-assets.entity';

@Entity()
export class Land extends SimpleEntity {
  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToOne(() => LandAssets, { nullable: true })
  assets?: LandAssets;

  @Column()
  name!: string;
}
