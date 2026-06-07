import { Land } from 'src/land/land.entity';
import { Territory } from 'src/territories/territory.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class AppBlock {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Land, (land) => land.appBlocks, { nullable: true, eager: true })
  @JoinColumn()
  inLand!: Land | null;

  @ManyToOne(() => Territory, (territory) => territory.appBlocks, { nullable: true, eager: true })
  @JoinColumn()
  inTerritory!: Territory | null;

  @Column('text')
  url!: string;

  constructor(props: {
    inLand: Land | null;
    inTerritory: Territory | null;
    url: string;
  })
  constructor()
  constructor(props?: {
    inLand: Land | null;
    inTerritory: Territory | null;
    url: string;
  }) {
    if (props) {
      this.inLand = props.inLand;
      this.inTerritory = props.inTerritory;
      this.url = props.url;
    }
  }
}
