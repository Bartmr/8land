import { z } from 'zod';
import { isUUID } from '../../uuid/is-uuid';

export function uuid(message?: string) {
  return z.string().refine((v) => isUUID(v), message || 'Must be an UUID');
}
