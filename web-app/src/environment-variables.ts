/* eslint-disable node/no-process-env */
import { z } from 'zod';
import { throwError } from './throw-error';

const isIntegrityCheck = !!process.env.IS_INTEGRITY_CHECK;

const booleanEnvVar = z.preprocess(
  (v) => (v == null ? undefined : v === 'true' || v === '1'),
  z.boolean().optional(),
);

const requiredString = z.string().trim().min(1, 'Must be filled');

const schema = z.object({
  HOST_URL: z
    .string()
    .refine(
      (v) => v.startsWith('https://') || v.startsWith('http://'),
      'Must start with http:// or https://',
    )
    .refine((v) => !v.endsWith('/'), 'Cannot have trailing slash'),
  PATH_PREFIX: z
    .string()
    .optional()
    .transform((v) => v ?? '')
    .refine(
      (v) => v === '' || (v.startsWith('/') && !v.endsWith('/')),
      'Path prefix must be either an empty string, or start with a "/" and also NOT end with a "/"',
    ),
  CI: booleanEnvVar,
  IS_INTEGRITY_CHECK: booleanEnvVar,
  DISABLE_ERROR_BOUNDARIES: booleanEnvVar,
  DISABLE_LOGGING_LIMIT: booleanEnvVar.transform((v) => {
    if (process.env.NODE_ENV === 'development') {
      return true;
    }
    return v;
  }),
  LOG_DEBUG: booleanEnvVar,
  MAIN_API_URL: requiredString,
  FIREBASE_AUTH_EMULATOR_URL: z.string().optional(),
  FIREBASE_CONFIG: z.object({
    apiKey: z.string(),
    authDomain: z.string(),
    projectId: z.string(),
    storageBucket: z.string(),
    messagingSenderId: z.string(),
    appId: z.string(),
  }),
  TERRITORIES_STORE_URL: requiredString,

  MORALIS_SERVER_URL: requiredString,
  MORALIS_APP_ID: requiredString,

  WEB3_NET: z.enum(['rinkeby', 'eth']),

  RARIBLE_URL: requiredString,

  SENTRY_DSN: z.string().optional(),

  GOOGLE_ANALYTICS_TRACKING_ID: z.string().optional(),
});

const result = schema.safeParse({
  HOST_URL: process.env.GATSBY_HOST_URL,
  PATH_PREFIX: process.env.GATSBY_PATH_PREFIX,
  CI: process.env.CI,
  IS_INTEGRITY_CHECK: process.env.IS_INTEGRITY_CHECK,
  DISABLE_ERROR_BOUNDARIES: process.env.GATSBY_DISABLE_ERROR_BOUNDARIES,
  DISABLE_LOGGING_LIMIT: process.env.GATSBY_DISABLE_LOGGING_LIMIT,
  LOG_DEBUG: process.env.GATSBY_LOG_DEBUG,
  MAIN_API_URL: process.env.GATSBY_MAIN_API_URL,
  FIREBASE_AUTH_EMULATOR_URL: process.env.GATSBY_FIREBASE_AUTH_EMULATOR_URL,
  FIREBASE_CONFIG: JSON.parse(
    process.env.GATSBY_FIREBASE_CONFIG || throwError(),
  ) as unknown,
  TERRITORIES_STORE_URL: process.env.GATSBY_TERRITORIES_STORE_URL,

  MORALIS_SERVER_URL: process.env.GATSBY_MORALIS_SERVER_URL,
  MORALIS_APP_ID: process.env.GATSBY_MORALIS_APP_ID,

  WEB3_NET: process.env.GATSBY_WEB3_NET,

  RARIBLE_URL: process.env.GATSBY_RARIBLE_URL,

  SENTRY_DSN: process.env.GATSBY_SENTRY_DSN,

  GOOGLE_ANALYTICS_TRACKING_ID: process.env.GATSBY_GOOGLE_ANALYTICS_TRACKING_ID,
});

if (!result.success) {
  throw new Error(JSON.stringify(result.error.issues, undefined, 2));
}

export const EnvironmentVariables = result.data;
