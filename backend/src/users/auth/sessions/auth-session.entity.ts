import { User } from 'src/users/user.entity';
import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class UserAuthSession {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, { eager: true })
  user!: User;

  constructor(props: {
    user: User;
  })
  constructor()
  constructor(props?: {
    user: User;
  }) {
    if (props) {
      this.user = props.user;
    }
  }
}
