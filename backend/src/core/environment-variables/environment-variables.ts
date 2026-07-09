import { z } from 'zod';



const ENVIRONMENT_VARIABLES_VALIDATION_SCHEMA = z.object({
  NODE_ENV: z.enum(["production"]).optional(),

  API_PORT: z.coerce.number(),

  JWT_SECRET: z.string(),

  LOG_DATABASES: z.coerce.boolean().optional(),

  LOG_DEBUG: z.coerce.boolean().optional(),


  WEB_APP_ORIGIN: z.string(),

  DATABASE_HOST: z.string(),
  DATABASE_PORT: z.coerce.number(),
  DATABASE_NAME: z.string(),
  DATABASE_USER: z.string(),
  DATABASE_PASSWORD: z.string(),

  AWS_ENDPOINT: z.string().optional(),
  AWS_REGION: z.string().optional(),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  S3_BUCKET_NAME: z.string().optional(),

  USE_DEV_EMAIL: z.coerce.boolean().optional(),

  START_LANDS_TOTAL_LIMIT: z.coerce.number().int(),


  LAND_LIMIT_PER_WORLD: z.coerce.number().int(),
});

export const EnvironmentVariables = ENVIRONMENT_VARIABLES_VALIDATION_SCHEMA.parse({
  /*
    Clone enumerable properties to avoid mutability issues
  */
  // eslint-disable-next-line node/no-process-env
  ...process.env,
});
