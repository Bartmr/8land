/* eslint-disable node/no-process-env */
import { throwError } from '@app/shared/internals/utils/throw-error';
import { boolean } from 'not-me/lib/schemas/boolean/boolean-schema';
import { equals } from 'not-me/lib/schemas/equals/equals-schema';
import { object } from 'not-me/lib/schemas/object/object-schema';
import { string } from 'not-me/lib/schemas/string/string-schema';
import { NodeEnv } from './node-env';
import { RUNNING_IN_SERVER } from './running-in';

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
  DISABLE_LOGGING_LIMIT: boolean().transform((v) => {
    if (process.env.NODE_ENV === 'development') {
      return true;
    } else {
      return v;
    }
  }),
  LOG_DEBUG: boolean(),
  MAIN_API_URL: string().filled(),
  FIREBASE_AUTH_EMULATOR_URL:
    [NodeEnv.Development, NodeEnv.Test].includes(
      process.env.NODE_ENV as NodeEnv,
    ) || isIntegrityCheck
      ? string().filled()
      : string(),
  FIREBASE_CONFIG: object({
    apiKey: string().filled(),
    authDomain: string().filled(),
    projectId: string().filled(),
    storageBucket: string().filled(),
    messagingSenderId: string().filled(),
    appId: string().filled(),
  }).required(),
  TERRITORIES_STORE_URL: string().filled(),

  MORALIS_SERVER_URL: string().filled(),
  MORALIS_APP_ID: string().filled(),

  WEB3_NET: equals(['rinkeby', 'eth']).required(),

  RARIBLE_URL: string().filled(),

  SENTRY_DSN:
    process.env.NODE_ENV === NodeEnv.Production &&
    process.env.IS_INTEGRITY_CHECK !== 'true'
      ? string().filled()
      : equals([]),

  ...(process.env.NODE_ENV === NodeEnv.Production &&
  process.env.IS_INTEGRITY_CHECK !== 'true' &&
  RUNNING_IN_SERVER
    ? {
        SENTRY_AUTH_TOKEN: string().filled(),
        SENTRY_ORG: string().filled(),
        SENTRY_PROJECT: string().filled(),
      }
    : {
        SENTRY_AUTH_TOKEN: equals([]),
        SENTRY_ORG: equals([]),
        SENTRY_PROJECT: equals([]),
      }),
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
  FIREBASE_CONFIG: JSON.parse(
    process.env.GATSBY_FIREBASE_CONFIG || throwError(),
  ) as unknown,
  TERRITORIES_STORE_URL: process.env.GATSBY_TERRITORIES_STORE_URL,

  MORALIS_SERVER_URL: process.env.GATSBY_MORALIS_SERVER_URL,
  MORALIS_APP_ID: process.env.GATSBY_MORALIS_APP_ID,

  WEB3_NET: process.env.GATSBY_WEB3_NET,

  RARIBLE_URL: process.env.GATSBY_RARIBLE_URL,

  SENTRY_DSN: process.env.GATSBY_SENTRY_DSN,

  SENTRY_AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN,
  SENTRY_ORG: process.env.SENTRY_ORG,
  SENTRY_PROJECT: process.env.SENTRY_PROJECT,
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
