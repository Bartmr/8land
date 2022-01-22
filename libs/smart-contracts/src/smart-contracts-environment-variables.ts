/* eslint-disable node/no-process-env */
import { object } from 'not-me/lib/schemas/object/object-schema';
import { string } from 'not-me/lib/schemas/string/string-schema';

const schema = object({
  WALLET_PRIVATE_KEY: string().filled(),
  ALCHEMY_URL: string().filled(),
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
