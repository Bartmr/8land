import { Land } from 'src/land/land.entity';
import { Territory } from 'src/territories/territory.entity';
import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class DoorBlock {
  @PrimaryGeneratedColumn('uuid')
  id!: string;
  @ManyToOne(() => Land, { eager: true, nullable: true })
  @JoinColumn()
  inLand!: Land | null;

  @ManyToOne(() => Territory, { lazy: true, nullable: true })
  @JoinColumn()
  inTerritory!: Promise<Territory | null>;

  @ManyToOne(() => Land, { eager: true })
  @JoinColumn()
  toLand!: Land;

  constructor(props: {
    inLand: Land | null;
    inTerritory: Promise<Territory | null>;
    toLand: Land;
  })
  constructor()
  constructor(props?: {
    inLand: Land | null;
    inTerritory: Promise<Territory | null>;
    toLand: Land;
  }) {
    if (props) {
      this.inLand = props.inLand;
      this.inTerritory = props.inTerritory;
      this.toLand = props.toLand;
    }
  }
}
