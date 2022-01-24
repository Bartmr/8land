/* eslint-disable node/no-process-env */
import { object } from 'not-me/lib/schemas/object/object-schema';
import { string } from 'not-me/lib/schemas/string/string-schema';

const schema = object({
  WALLET_PUBLIC_KEY: string().filled(),
  WALLET_PRIVATE_KEY: string().filled(),
  MORALIS_SERVER_URL: string().filled(),
  MORALIS_APP_ID: string().filled(),
  MORALIS_SPEEDY_NODE: string().filled(),
}).required();

const environmentVariablesValidationResult = schema.validate({
  ...process.env,
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

export const SmartContractsEnvironmentVariables =
  environmentVariablesValidationResult.value;
