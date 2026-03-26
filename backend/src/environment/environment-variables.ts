import { z } from 'zod';



const ENVIRONMENT_VARIABLES_VALIDATION_SCHEMA = z.object({
  LOG_DATABASES: z.coerce.boolean().optional(),

  LOG_DEBUG: z.coerce.boolean().optional(),

  WEB_APP_ORIGIN: z.string(),

  DATABASE_HOST: z.string(),
  DATABASE_PORT: z.coerce.number(),
  DATABASE_NAME: z.string(),
  DATABASE_USER: z.string(),
  DATABASE_PASSWORD: z.string(),

  FIREBASE_AUTH_EMULATOR_HOST: z.string().optional(),
  FIREBASE_PROJECT_ID: z.string().optional(),

  GOOGLE_APPLICATION_CREDENTIALS: z.string().optional(),

  API_PORT: z.coerce.number().optional(),

  AWS_ENDPOINT: z.string().optional(),
  AWS_REGION: z.string().optional(),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  S3_BUCKET_NAME: z.string().optional(),

  USE_DEV_EMAIL: z.coerce.boolean().optional()
});

export const EnvironmentVariables = ENVIRONMENT_VARIABLES_VALIDATION_SCHEMA.parse({
  /*
    Clone enumerable properties to avoid mutability issues
  */
  // eslint-disable-next-line node/no-process-env
  ...process.env,
});
