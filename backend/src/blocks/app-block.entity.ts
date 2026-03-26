import { Land } from 'src/land/land.entity';
import { Territory } from 'src/territories/territory.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class AppBlock {
  @PrimaryGeneratedColumn('uuid')
  id!: string;
  @ManyToOne(() => Land, { lazy: true, nullable: true })
  @JoinColumn()
  inLand!: Promise<Land | null>;

  @ManyToOne(() => Territory, { lazy: true, nullable: true })
  @JoinColumn()
  inTerritory!: Promise<Territory | null>;

  @Column('text')
  url!: string;

  constructor(props: {
    inLand: Promise<Land | null>;
    inTerritory: Promise<Territory | null>;
    url: string;
  })
  constructor()
  constructor(props?: {
    inLand: Promise<Land | null>;
    inTerritory: Promise<Territory | null>;
    url: string;
  }) {
    if (props) {
      this.inLand = props.inLand;
      this.inTerritory = props.inTerritory;
      this.url = props.url;
    }
  }
}
