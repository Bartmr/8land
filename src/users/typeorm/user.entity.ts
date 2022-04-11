import { getEnumValues } from 'libs/shared/src/internals/utils/enums/get-enum-values';
import { Role } from 'src/auth/roles/roles';
import { SimpleEntity } from 'src/internals/databases/simple-entity/simple.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  UpdateDateColumn,
} from 'typeorm';
import { NavigationState } from './navigation-state.entity';

@Entity()
export class User extends SimpleEntity {
  @Column({ unique: true })
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

  @Column('text', { nullable: true })
  walletAddress!: string | null;

  @Column('text')
  walletNonce!: string;

  @Column({ generated: 'uuid', unique: true })
  appId!: string;

  @OneToMany(() => NavigationState, (e) => e.user, { lazy: true })
  navigationState!: Promise<NavigationState | null>;

  toJSON() {
    return {
      ...this,
      firebaseUid: undefined,
      walletNonce: undefined,
      walletAddress: undefined,
    };
  }
}
