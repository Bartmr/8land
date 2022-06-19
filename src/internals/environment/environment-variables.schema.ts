import { NODE_ENV } from './node-env.constants';
import { NodeEnv } from './node-env.types';
import { object } from 'not-me/lib/schemas/object/object-schema';
import { number } from 'not-me/lib/schemas/number/number-schema';
import { string } from 'not-me/lib/schemas/string/string-schema';
import { boolean } from 'not-me/lib/schemas/boolean/boolean-schema';
import { equals } from 'not-me/lib/schemas/equals/equals-schema';

const stringFailIfEmptyInProd =
  NODE_ENV === NodeEnv.Production
    ? string()
        .required()
        .transform((s) => s.trim())
        .test((s) => (s.length > 0 ? null : 'Must be filled'))
    : string();

export const ENVIRONMENT_VARIABLES_VALIDATION_SCHEMA = object({
  HOT_RELOAD_DATABASE_MIGRATIONS_ROLLBACK_STEPS: (() => {
    if (NODE_ENV === NodeEnv.Development || NODE_ENV === NodeEnv.Test) {
      return number().required();
    } else {
      return equals([undefined]).transform(() => 0);
    }
  })(),

  LOG_DATABASES: boolean().notNull(),

  LOG_DEBUG: boolean(),

  LOG_REQUEST_CONTENTS_ON_ERROR: boolean(),

  SHOW_ALL_LOGS_IN_TESTS: boolean(),

  ENABLE_SWAGGER: boolean().transform((value) => {
    if (NODE_ENV === NodeEnv.Development) {
      return true;
    } else {
      return value;
    }
  }),

  WEB_APP_ORIGIN: string()
    .required()
    .transform((s) => s.trim())
    .test((s) => (s.length > 0 ? null : 'Must be filled'))
    .transform((s) => s.split(',')),

  DATABASE_HOST: string()
    .required()
    .transform((s) => s.trim())
    .test((s) => (s.length > 0 ? null : 'Must be filled')),
  DATABASE_PORT: number().required(),
  DATABASE_NAME: string()
    .required()
    .transform((s) => s.trim())
    .test((s) => (s.length > 0 ? null : 'Must be filled')),
  DATABASE_USER: string()
    .required()
    .transform((s) => s.trim())
    .test((s) => (s.length > 0 ? null : 'Must be filled')),
  DATABASE_PASSWORD: string()
    .required()
    .transform((s) => s.trim())
    .test((s) => (s.length > 0 ? null : 'Must be filled')),
  DATABASE_CA_CERTIFICATE:
    NODE_ENV === NodeEnv.Production
      ? string()
          .required()
          .test((s) => (s.length > 0 ? null : 'Must be filled'))
      : string(),

  AUTH_TOKEN_TTL: number()
    .notNull()
    .transform((value) => {
      if (value === undefined) {
        return 60 * 60 * 24 * 30;
      } else {
        return value;
      }
    }),

  FIREBASE_AUTH_EMULATOR_HOST: [NodeEnv.Development, NodeEnv.Test].includes(
    NODE_ENV as NodeEnv,
  )
    ? string()
        .required()
        .transform((s) => s.trim())
        .test((s) => (s.length > 0 ? null : 'Must be filled'))
    : string(),
  FIREBASE_PROJECT_ID: [NodeEnv.Development, NodeEnv.Test].includes(
    NODE_ENV as NodeEnv,
  )
    ? string()
        .required()
        .transform((s) => s.trim())
        .test((s) => (s.length > 0 ? null : 'Must be filled'))
    : string(),

  GOOGLE_APPLICATION_CREDENTIALS: [NodeEnv.Development, NodeEnv.Test].includes(
    NODE_ENV as NodeEnv,
  )
    ? string()
    : equals(['/usr/src/app/service-account-file.json']).required(),

  API_PORT: number().transform((v) => {
    if (v == null) {
      return 3000;
    } else {
      return v;
    }
  }),

  AWS_ENDPOINT: stringFailIfEmptyInProd.test((s) =>
    s ? (s.endsWith('/') ? 'Cannot have trailling slash' : null) : null,
  ),
  AWS_REGION: stringFailIfEmptyInProd,
  AWS_ACCESS_KEY_ID: stringFailIfEmptyInProd,
  AWS_SECRET_ACCESS_KEY: stringFailIfEmptyInProd,
  S3_BUCKET_NAME: stringFailIfEmptyInProd,

  RARIBLE_ENVIRONMENT: equals(['prod', 'dev'] as const).required(),
}).required();
