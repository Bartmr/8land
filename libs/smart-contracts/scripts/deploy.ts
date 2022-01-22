/* eslint-disable node/no-process-env */

// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import hre from 'hardhat';

async function main() {
  const TerritoryNFT = await hre.ethers.getContractFactory('TerritoryNFT');
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
