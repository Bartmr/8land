import { User } from 'src/users/user.entity';

export class AuthContext {
  user: User;

  constructor(params: { user: User }) {
    this.user = params.user;
  }
}
