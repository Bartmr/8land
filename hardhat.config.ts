/* eslint-disable node/no-process-env */
import 'tsconfig-paths/register';
// import { task } from "hardhat/config";
import '@nomiclabs/hardhat-waffle';
import '@typechain/hardhat';
import { object } from 'not-me/lib/schemas/object/object-schema';
import { string } from 'not-me/lib/schemas/string/string-schema';

import path from 'path';

import dotenv from 'dotenv';

if (
  process.env['NODE_ENV'] === 'development' ||
  process.env['IS_INTEGRITY_CHECK'] === 'true'
) {
  dotenv.config({
    path: path.join(process.cwd(), `.env.development`),
  });
  dotenv.config({
    path: path.join(process.cwd(), `.env.secrets.development`),
  });
}

// // This is a sample Hardhat task. To learn how to create your own go to
// // https://hardhat.org/guides/create-task.html
// task("accounts", "Prints the list of accounts", async (args, hre) => {
//   const accounts = await hre.ethers.getSigners();

//   for (const account of accounts) {
//     console.log(account.address);
//   }
// });

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const environmentVariablesValidationResult = object({
  WALLET_PRIVATE_KEY: string().filled(),
})
  .required()
  // eslint-disable-next-line node/no-process-env
  .validate({ ...process.env });

if (environmentVariablesValidationResult.errors) {
  throw new Error(
    JSON.stringify(environmentVariablesValidationResult.messagesTree),
  );
}

export default {
  solidity: '0.8.0',
  paths: {
    root: path.resolve(__dirname, 'libs', 'smart-contracts'),
  },
  defaultNetwork: 'matic',
  networks: {
    matic: {
      url: 'https://rpc-mumbai.maticvigil.com',
    },
  },
};
