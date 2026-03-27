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

  @Column({ generated: 'uuid', unique: true })
  appId!: string;

  constructor(props: {
    firebaseUid: string;
    isAdmin: boolean;
    walletAddress: string | null;
    walletNonce: string;
    appId: string;
  })
  constructor()
  constructor(props?: {
    firebaseUid: string;
    isAdmin: boolean;
    appId: string;
  }) {
    if (props) {
      this.firebaseUid = props.firebaseUid;
      this.isAdmin = props.isAdmin;
      this.appId = props.appId;
    }
  }

  toJSON() {
    return {
      ...this,
      firebaseUid: undefined,
    };
  }
}
