import { Land } from 'src/land/land.entity';
import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class DoorBlock {
  @PrimaryGeneratedColumn('uuid')
  id!: string;
  @ManyToOne(() => Land, { eager: true, nullable: true })
  @JoinColumn()
  inLand!: Land | null;


  @ManyToOne(() => Land, { eager: true })
  @JoinColumn()
  toLand!: Land;

  constructor(props: {
    inLand: Land | null;
    toLand: Land;
  })
  constructor()
  constructor(props?: {
    inLand: Land | null;
    toLand: Land;
  }) {
    if (props) {
      this.inLand = props.inLand;
      this.toLand = props.toLand;
    }
  }
}
