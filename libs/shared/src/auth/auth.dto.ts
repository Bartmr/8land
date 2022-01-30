import { ValidationSchema } from '../internals/validation/validation-schema.decorator';
import { Role } from './auth.enums';
import { loginRequestSchema } from './auth.schemas';

@ValidationSchema(loginRequestSchema)
export class LoginRequestDTO {
  firebaseIdToken!: string;
}

export class AuthSessionDTO {
  userId!: string;
  role!: Role;
  walletAddress!: string | null;
}

export class LoginResponseDTO {
  authTokenId!: string;
  session!: AuthSessionDTO;
}
