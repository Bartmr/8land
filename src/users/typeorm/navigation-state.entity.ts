import { DoorBlock } from 'src/blocks/typeorm/door-block.entity';
import { SimpleEntity } from 'src/internals/databases/simple-entity/simple.entity';
import { Column, Entity, ManyToOne, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class NavigationState extends SimpleEntity {
  @ManyToOne(() => User, { lazy: true })
  user!: Promise<User>;

  @Column('timestamp', { nullable: true })
  lastSavedAt!: Date | null;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne(() => DoorBlock, { eager: true, nullable: true })
  lastDoor!: DoorBlock | null;

  @Column('bool', { nullable: true })
  isComingBack!: null | boolean;

  @Column('bool', { nullable: true })
  lastDoorWasDeleted!: boolean | null;

  @Column('text', { nullable: true })
  lastPlayedBackgroundMusicUrl!: string | null;
}
