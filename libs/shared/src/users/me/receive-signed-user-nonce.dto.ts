import { ValidationSchema } from '../../internals/validation/validation-schema.decorator';
import { ReceiveSignedUserNonceRequestSchema } from './receive-signed-user-nonce.schema';

@ValidationSchema(ReceiveSignedUserNonceRequestSchema)
export class ReceiveSignedUserNonceRequestDTO {
  signedNonce!: string;
}
