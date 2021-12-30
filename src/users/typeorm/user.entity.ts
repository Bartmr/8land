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

  toJSON() {
    return {
      ...this,
      firebaseUid: undefined,
    };
  }
}
