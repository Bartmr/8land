import { DoorBlock } from 'src/blocks/typeorm/door-block.entity';
import { SimpleEntity } from 'src/internals/databases/simple-entity/simple.entity';
import { Land } from 'src/land/typeorm/land.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class NavigationState extends SimpleEntity {
  @ManyToOne(() => User, { lazy: true })
  user!: Promise<User>;

  /*
    Player last entered a land using 'navigate'.
    If paired with boardedOnTrainStation and traveledByTrainToLand,
    means he called 'navigate' inside an end-user land
  */
  @ManyToOne(() => DoorBlock, { eager: true, nullable: true })
  lastDoor!: DoorBlock | null;

  @Column('bool', { nullable: true })
  cameBack!: null | boolean;

  /*
    Used to make the player return to the last train station
    he boarded, either when escaping, or returning to the
    end-user land start block.

    should be null if traveledByTrainToLand is also null
  */
  @ManyToOne(() => Land, { eager: true, nullable: true })
  boardedOnTrainStation!: Land | null;

  /*
    if lastDoor is null and traveledByTrainToLand is populated,
    it means the last user action was to board an end-user land
    and didn't traveled to another location yet
  */
  @ManyToOne(() => Land, { eager: true, nullable: true })
  traveledByTrainToLand!: Land | null;

  @Column('text', { nullable: true })
  lastPlayedBackgroundMusicUrl!: string | null;

  @Column('bool', { nullable: true })
  lastCheckpointWasDeleted!: boolean | null;
}
