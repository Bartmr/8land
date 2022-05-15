import { DoorBlock } from 'src/blocks/typeorm/door-block.entity';
import { SimpleEntity } from 'src/internals/databases/simple-entity/simple.entity';
import { Land } from 'src/land/typeorm/land.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class NavigationState extends SimpleEntity {
  @ManyToOne(() => User, { lazy: true })
  user!: Promise<User>;

  @ManyToOne(() => DoorBlock, { eager: true, nullable: true })
  lastDoor!: DoorBlock | null;

  @Column('bool', { nullable: true })
  isComingBack!: null | boolean;

  @ManyToOne(() => Land, { eager: true, nullable: true })
  traveledByTrainToLand!: Land | null;

  @ManyToOne(() => Land, { eager: true, nullable: true })
  boardedOnTrainStation!: Land | null;

  @Column('text', { nullable: true })
  lastPlayedBackgroundMusicUrl!: string | null;

  @Column('bool', { nullable: true })
  lastCheckpointWasDeleted!: boolean | null;
}
