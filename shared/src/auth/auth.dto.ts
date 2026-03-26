import { ValidationSchema } from '../validation/validation-schema.decorator';
import { loginRequestSchema } from './auth.schemas';

@ValidationSchema(loginRequestSchema)
export class LoginRequestDTO {
  firebaseIdToken!: string;
}

export class AuthSessionDTO {
  userId!: string;
  isAdmin!: boolean;
  walletAddress!: string | null;
  appId!: string;
}

export class LoginResponseDTO {
  authTokenId!: string;
  session!: AuthSessionDTO;
}
