export class LoginRequestDTO {
  email!: string;
  password!: string;
}

export class SignupRequestDTO {
  email!: string;
  password!: string;
}

export class AuthSessionDTO {
  userId!: string;
  isAdmin!: boolean;
  appId!: string;
}

export class LoginResponseDTO {
  authTokenId!: string;
  session!: AuthSessionDTO;
}
