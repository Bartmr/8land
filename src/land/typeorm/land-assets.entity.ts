import { SimpleEntity } from 'src/internals/databases/simple-entity/simple.entity';
import { Column, Entity } from 'typeorm';

@Entity()
export class LandAssets extends SimpleEntity {
  @Column('text')
  tiledJsonStorageKey!: string;

  @Column('text')
  tiledJsonURL!: string;

  @Column('text')
  tilesetImageStorageKey!: string;

  @Column('text')
  tilesetImageURL!: string;
}
