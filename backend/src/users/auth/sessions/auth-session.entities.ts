import { User } from 'src/users/user.entities';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class UserAuthSession {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, { eager: true })
  user!: User;

  @Column()
  expiresAt!: Date;

  constructor(props: {
    user: User;
    expiresAt: Date;
  })
  constructor()
  constructor(props?: {
    user: User;
    expiresAt: Date;
  }) {
    if (props) {
      this.user = props.user;
      this.expiresAt = props.expiresAt;
    }
  }
}
