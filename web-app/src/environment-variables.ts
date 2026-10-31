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
  API_URL: requiredString,

  SENTRY_DSN: z.string().optional(),

  GOOGLE_ANALYTICS_TRACKING_ID: z.string().optional(),
});


const result = schema.safeParse({
  SITE_URL: process.env.GATSBY_SITE_URL,
  API_URL: process.env.GATSBY_API_URL,

  SENTRY_DSN: process.env.GATSBY_SENTRY_DSN,

  GOOGLE_ANALYTICS_TRACKING_ID: process.env.GATSBY_GOOGLE_ANALYTICS_TRACKING_ID,
});

if (!result.success) {
  throw new Error(JSON.stringify(result.error.issues, undefined, 2));
}

export const EnvironmentVariables = result.data;
