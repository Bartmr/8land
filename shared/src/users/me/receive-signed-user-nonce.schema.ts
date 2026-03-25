import { z } from 'zod';
import { ReceiveSignedUserNonceRequestDTO } from './receive-signed-user-nonce.dto';

export const ReceiveSignedUserNonceRequestSchema: z.ZodType<ReceiveSignedUserNonceRequestDTO> =
  z.object({
    signedNonce: z
      .string()
      .refine((s) => s.trim().length > 0, 'Must be filled'),
  });
