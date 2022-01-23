import 'src/internals/environment/load-environment-variables';

import { ethers } from 'ethers';
import { SmartContractsEnvironmentVariables } from 'src/internals/databases/smart-contracts-environment-variables';
import territoryNFTMetadata from 'libs/smart-contracts/artifacts/contracts/TerritoryNFT.sol/TerritoryNFT.json';
import { throwError } from 'src/internals/utils/throw-error';

async function main() {
  const provider = new ethers.providers.AlchemyProvider(
    'maticmum',
    (() => {
      const splitAlchemyUrl =
        SmartContractsEnvironmentVariables.ALCHEMY_URL.split('/');

      return splitAlchemyUrl[splitAlchemyUrl.length - 1] || throwError();
    })(),
  );

  const wallet = new ethers.Wallet(
    SmartContractsEnvironmentVariables.WALLET_PRIVATE_KEY,
    provider,
  );

  const TerritoryNFT = new ethers.ContractFactory(
    territoryNFTMetadata.abi,
    territoryNFTMetadata.bytecode,
    wallet,
  );

  const territoryNFT = await TerritoryNFT.deploy();
  await territoryNFT.deployed();

  // eslint-disable-next-line no-console
  console.log('TerritoryNFT deployed to:', territoryNFT.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exit(1);
});
