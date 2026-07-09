import { Land } from 'src/features/land/land.entities';
import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class DoorBlock {
  @PrimaryGeneratedColumn('uuid')
  id!: string;
  @ManyToOne(() => Land, { eager: true})
  @JoinColumn()
  inLand!: Land;


  @ManyToOne(() => Land, { eager: true })
  @JoinColumn()
  toLand!: Land;

  constructor(props: {
    inLand: Land;
    toLand: Land;
  })
  constructor()
  constructor(props?: {
    inLand: Land;
    toLand: Land;
  }) {
    if (props) {
      this.inLand = props.inLand;
      this.toLand = props.toLand;
    }
  }
}
