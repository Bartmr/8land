import { getEnumValues } from 'libs/shared/src/internals/utils/enums/get-enum-values';
import { Role } from 'src/auth/roles/roles';
import { SimpleEntity } from 'src/internals/databases/simple-entity/simple.entity';
import { Column, DeleteDateColumn, Entity, Unique } from 'typeorm';

@Entity()
@Unique(['firebaseUid'])
export class User extends SimpleEntity {
  @Column()
  firebaseUid!: string;

  @DeleteDateColumn()
  deletedAt?: Date;

  @Column({
    type: 'enum',
    enum: getEnumValues(Role),
  })
  role!: Role;
}
