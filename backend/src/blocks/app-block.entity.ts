import { Land } from 'src/land/land.entity';
import { Territory } from 'src/territories/territory.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class AppBlock {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Land, (land) => land.appBlocks, { nullable: true })
  @JoinColumn()
  inLand!: Promise<Land | null>;

  @ManyToOne(() => Territory, (territory) => territory.appBlocks, { nullable: true })
  @JoinColumn()
  inTerritory!: Promise<Territory | null>;

  @Column('text')
  url!: string;

  constructor(props: {
    url: string;
  })
  constructor()
  constructor(props?: {
    url: string;
  }) {
    if (props) {
      this.url = props.url;
    }
  }
}
