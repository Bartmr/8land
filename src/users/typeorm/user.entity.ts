import { getEnumValues } from 'libs/shared/src/internals/utils/enums/get-enum-values';
import { Role } from 'src/auth/roles/roles';
import { SimpleEntity } from 'src/internals/databases/simple-entity/simple.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
@Unique(['firebaseUid'])
export class User extends SimpleEntity {
  @Column()
  firebaseUid!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt!: Date | null;

  @Column({
    type: 'enum',
    enum: getEnumValues(Role),
  })
  role!: Role;

  /*
    TODO: create app id for identifying user in apps
    must be unique and hidden (strip appId in toJSON())
    should only be visible in the session object
  */

  toJSON() {
    return {
      ...this,
      firebaseUid: undefined,
    };
  }
}
