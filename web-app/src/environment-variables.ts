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
  SITE_URL: z
    .string()
    .refine(
      (v) => v.startsWith('https://') || v.startsWith('http://'),
      'Must start with http:// or https://',
    )
    .refine((v) => !v.endsWith('/'), 'Cannot have trailing slash'),
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
  }).optional(),

  SENTRY_DSN: z.string().optional(),

  GOOGLE_ANALYTICS_TRACKING_ID: z.string().optional(),
});


const result = schema.safeParse({
  SITE_URL: process.env.GATSBY_SITE_URL,
  MAIN_API_URL: process.env.GATSBY_MAIN_API_URL,
  FIREBASE_AUTH_EMULATOR_URL: process.env.GATSBY_FIREBASE_AUTH_EMULATOR_URL,
  FIREBASE_CONFIG: process.env.GATSBY_FIREBASE_CONFIG ? JSON.parse(
    process.env.GATSBY_FIREBASE_CONFIG,
  ) : undefined,

  SENTRY_DSN: process.env.GATSBY_SENTRY_DSN,

  GOOGLE_ANALYTICS_TRACKING_ID: process.env.GATSBY_GOOGLE_ANALYTICS_TRACKING_ID,
});

if (!result.success) {
  throw new Error(JSON.stringify(result.error.issues, undefined, 2));
}

export const EnvironmentVariables = result.data;
