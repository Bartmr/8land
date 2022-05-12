import { DoorBlock } from 'src/blocks/typeorm/door-block.entity';
import { SimpleEntity } from 'src/internals/databases/simple-entity/simple.entity';
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

  @Column('text', { nullable: true })
  lastPlayedBackgroundMusicUrl!: string | null;

  @Column('bool', { nullable: true })
  lastCheckpointWasDeleted!: boolean | null;
}
