import { SimpleEntity } from 'src/internals/databases/simple-entity/simple.entity';
import { Land } from 'src/land/typeorm/land.entity';
import { User } from 'src/users/typeorm/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
} from 'typeorm';

@Entity()
export class World extends SimpleEntity {
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
}
