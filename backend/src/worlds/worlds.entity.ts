import { Land } from 'src/land/land.entity';
import { User } from 'src/users/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class World {
  @PrimaryGeneratedColumn('uuid')
  id!: string;
  @CreateDateColumn()
  createdAt!: Date;

  @ManyToOne(() => User, { lazy: true })
  user!: Promise<User>;

  @OneToMany(() => Land, (e) => e.world, { lazy: true })
  lands!: Promise<Land[]>;

  /*
    Once you upload a land block with a start block, you can never delete it
    or change it without a start block in its map
  */
  @Column('boolean', { nullable: true })
  hasStartLand!: boolean | null;

  constructor(props: {
    user: Promise<User>;
    lands: Promise<Land[]>;
  })
  constructor()
  constructor(props?: {
    user: Promise<User>;
    lands: Promise<Land[]>;
  }) {
    if (props) {
      this.user = props.user;
      this.lands = props.lands;
    }
  }
}
