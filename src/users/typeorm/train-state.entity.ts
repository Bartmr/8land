import { SimpleEntity } from 'src/internals/databases/simple-entity/simple.entity';
import { Land } from 'src/land/typeorm/land.entity';
import { CreateDateColumn, Entity, ManyToOne, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class TrainState extends SimpleEntity {
  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne(() => User, { lazy: true })
  user!: Promise<User>;

  @ManyToOne(() => Land, { eager: true })
  destinationLand!: Land;

  @ManyToOne(() => Land, { eager: true })
  boardedOn!: Land;
}
