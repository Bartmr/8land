import { SimpleEntity } from 'src/internals/databases/simple-entity/simple.entity';
import { Land } from 'src/land/typeorm/land.entity';
import { User } from 'src/users/typeorm/user.entity';
import { CreateDateColumn, Entity, ManyToOne, OneToMany } from 'typeorm';

@Entity()
export class World extends SimpleEntity {
  @CreateDateColumn()
  createdAt!: Date;

  @ManyToOne(() => User, { lazy: true })
  user!: Promise<User>;

  @OneToMany(() => Land, (e) => e.world, { lazy: true })
  lands!: Promise<Land[]>;
}
