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
  email!: string;

  @Column()
  passwordHash!: string;

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
    email: string;
    passwordHash: string;
    isAdmin: boolean;
    appId: string;
  })
  constructor()
  constructor(props?: {
    email: string;
    passwordHash: string;
    isAdmin: boolean;
    appId: string;
  }) {
    if (props) {
      this.email = props.email;
      this.passwordHash = props.passwordHash;
      this.isAdmin = props.isAdmin;
      this.appId = props.appId;
    }
  }

  public toJSON() {
    return {
      ...this,
      passwordHash: undefined,
    };
  }
}
