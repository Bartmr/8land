/* eslint-disable node/no-process-env */
import dotenv from 'dotenv';
import path from 'path';
import { NodeEnv } from './node-env.types';

const NODE_ENV = process.env['NODE_ENV'];

if (
  NODE_ENV === NodeEnv.Development ||
  process.env['IS_INTEGRITY_CHECK'] === 'true'
) {
  dotenv.config({
    path: path.join(process.cwd(), `.env.development`),
  });
  dotenv.config({
    path: path.join(process.cwd(), `.env.secrets.development`),
  });
} else if (NODE_ENV === NodeEnv.Test) {
  dotenv.config({
    path: path.join(process.cwd(), `.env.test`),
  });
  dotenv.config({
    path: path.join(process.cwd(), `.env.secrets.test`),
  });
} else if (NODE_ENV === NodeEnv.Production) {
  // NO-OP
} else {
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  throw new Error(`Unexpected NODE_ENV: ${NODE_ENV}`);
}
