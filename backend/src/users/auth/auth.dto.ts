export class LoginRequestDTO {
  firebaseIdToken!: string;
}

export class AuthSessionDTO {
  userId!: string;
  isAdmin!: boolean;
  appId!: string;
}

export class LoginResponseDTO {
  session!: AuthSessionDTO;
}
