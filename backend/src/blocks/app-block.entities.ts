import { Land } from 'src/land/land.entities';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class AppBlock {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Land, (land) => land.appBlocks, { nullable: true, eager: true })
  @JoinColumn()
  inLand!: Land | null;


  @Column("text")
  url!: string;

  constructor(props: {
    inLand: Land | null;
    url: string;
  })
  constructor()
  constructor(props?: {
    inLand: Land | null;
    url: string;
  }) {
    if (props) {
      this.inLand = props.inLand;
      this.url = props.url;
    }
  }
}
