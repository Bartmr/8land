/* eslint-disable node/no-process-env */
import 'tsconfig-paths/register';

import 'src/internals/environment/load-environment-variables';

import '@typechain/hardhat';

import path from 'path';

// import { task } from "hardhat/config";
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

export default {
  solidity: '0.8.1',
  paths: {
    root: path.resolve(__dirname, 'libs', 'smart-contracts'),
  },
  typechain: {
    target: 'ethers-v5',
  },
};
