/* eslint-disable node/no-process-env */
import { boolean } from 'not-me/lib/schemas/boolean/boolean-schema';
import { object } from 'not-me/lib/schemas/object/object-schema';
import { string } from 'not-me/lib/schemas/string/string-schema';
import { NodeEnv } from './node-env';

const isIntegrityCheck = !!process.env.IS_INTEGRITY_CHECK;

const schema = object({
  HOST_URL: string()
    .required()
    .test((hostUrl) =>
      hostUrl.startsWith('https://') || hostUrl.startsWith('http://')
        ? null
        : 'Must start with http:// or https://',
    )
    .test((hostUrl) =>
      hostUrl.endsWith('/') ? 'Cannot have trailling slash' : null,
    ),
  PATH_PREFIX: string()
    .transform((pathPrefix) => pathPrefix || '')
    .test((pathPrefix) => {
      if (
        pathPrefix === '' ||
        (pathPrefix.startsWith('/') && !pathPrefix.endsWith('/'))
      ) {
        return null;
      } else {
        return 'Path prefix must be either an empty string, or start with a "/" and also NOT end with a "/"';
      }
    }),
  CI: boolean(),
  IS_INTEGRITY_CHECK: boolean(),
  DISABLE_ERROR_BOUNDARIES: boolean(),
  LOG_DEBUG: boolean(),
  MAIN_API_URL: string().filled(),
  FIREBASE_AUTH_EMULATOR_URL:
    [NodeEnv.Development, NodeEnv.Test].includes(
      process.env.NODE_ENV as NodeEnv,
    ) || isIntegrityCheck
      ? string().filled()
      : string(),
  FIREBASE_API_KEY: string().filled(),
  FIREBASE_AUTH_DOMAIN: string().filled(),
  FIREBASE_PROJECT_ID: string().filled(),
  FIREBASE_STORAGE_BUCKET: string().filled(),
  FIREBASE_MESSAGING_SENDER_ID: string().filled(),
  FIREBASE_APP_ID: string().filled(),
}).required();

const environmentVariablesValidationResult = schema.validate({
  HOST_URL: process.env.GATSBY_HOST_URL,
  PATH_PREFIX: process.env.GATSBY_PATH_PREFIX,
  CI: process.env.CI,
  IS_INTEGRITY_CHECK: process.env.IS_INTEGRITY_CHECK,
  DISABLE_ERROR_BOUNDARIES: process.env.GATSBY_DISABLE_ERROR_BOUNDARIES,
  LOG_DEBUG: process.env.GATSBY_LOG_DEBUG,
  MAIN_API_URL: process.env.GATSBY_MAIN_API_URL,
  FIREBASE_AUTH_EMULATOR_URL: process.env.GATSBY_FIREBASE_AUTH_EMULATOR_URL,
  FIREBASE_API_KEY: process.env.GATSBY_FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN: process.env.GATSBY_FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID: process.env.GATSBY_FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET: process.env.GATSBY_FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID: process.env.GATSBY_FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID: process.env.GATSBY_FIREBASE_APP_ID,
});

if (environmentVariablesValidationResult.errors) {
  throw new Error(
    JSON.stringify(
      environmentVariablesValidationResult.messagesTree,
      undefined,
      2,
    ),
  );
}

export const EnvironmentVariables = environmentVariablesValidationResult.value;
