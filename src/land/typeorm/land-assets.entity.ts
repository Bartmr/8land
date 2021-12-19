import { SimpleEntity } from 'src/internals/databases/simple-entity/simple.entity';
import { Column, CreateDateColumn, Entity, UpdateDateColumn } from 'typeorm';

@Entity()
export class LandAssets extends SimpleEntity {
  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column()
  tiledJsonUrl!: string;

  @Column()
  tilesetImageUrl!: string;
}
