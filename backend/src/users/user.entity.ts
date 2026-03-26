import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;
  @Column({ unique: true })
  firebaseUid!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt!: Date | null;

  @Column({ default: false })
  isAdmin!: boolean;

  @Column('text', { nullable: true })
  walletAddress!: string | null;

  @Column('text')
  walletNonce!: string;

  @Column({ generated: 'uuid', unique: true })
  appId!: string;

  toJSON() {
    return {
      ...this,
      firebaseUid: undefined,
      walletNonce: undefined,
      walletAddress: undefined,
    };
  }
}
