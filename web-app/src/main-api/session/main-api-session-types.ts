import { AuthSessionDTO, LoginResponseDTO } from '@shared/auth/auth.dto';
import { ToIndexedType } from '@shared/internals/transports/dto-types';

export type MainApiSessionData = ToIndexedType<AuthSessionDTO>;
export type LoginResponse = ToIndexedType<LoginResponseDTO>;
