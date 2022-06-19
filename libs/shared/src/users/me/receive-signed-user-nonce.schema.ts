import { object } from 'not-me/lib/schemas/object/object-schema';
import { Schema } from 'not-me/lib/schemas/schema';
import { string } from 'not-me/lib/schemas/string/string-schema';
import { ReceiveSignedUserNonceRequestDTO } from './receive-signed-user-nonce.dto';

export const ReceiveSignedUserNonceRequestSchema: Schema<ReceiveSignedUserNonceRequestDTO> =
  object({
    signedNonce: string()
      .required()
      .test((s) => (s.trim().length > 0 ? null : 'Must be filled')),
  }).required();
