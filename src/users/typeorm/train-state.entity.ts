import { SimpleEntity } from 'src/internals/databases/simple-entity/simple.entity';
import { Land } from 'src/land/typeorm/land.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class TrainState extends SimpleEntity {
  @ManyToOne(() => User, { lazy: true })
  user!: Promise<User>;

  @ManyToOne(() => Land, { eager: true })
  destinationLand!: Land | null;

  @ManyToOne(() => Land, { eager: true })
  boardedIn!: Land | null;

  @Column('timestamp')
  boardedAt!: Date | null;
}
