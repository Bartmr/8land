import { User } from 'src/users/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class AuthToken {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  httpOnlyKey!: string;

  @ManyToOne(() => User, { eager: true })
  user!: User;

  @Column()
  expires!: Date;

  constructor(props: {
    httpOnlyKey: string;
    user: User;
    expires: Date;
  })
  constructor()
  constructor(props?: {
    httpOnlyKey: string;
    user: User;
    expires: Date;
  }) {
    if (props) {
      this.httpOnlyKey = props.httpOnlyKey;
      this.user = props.user;
      this.expires = props.expires;
    }
  }
}
