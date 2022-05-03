import Moralis from 'moralis';
import { EnvironmentVariables } from 'src/logic/app-internals/runtime/environment-variables';
import { useTerritoriesAPI } from 'src/logic/territories/territories-api';

export function useMintTerritory() {
  const api = useTerritoriesAPI();

  const mintTerritory = async ({
    territoryId,
    nftMetadata,
  }: {
    territoryId: string;
    nftMetadata: unknown;
  }) => {
    await Moralis.start({
      serverUrl: EnvironmentVariables.MORALIS_SERVER_URL,
      appId: EnvironmentVariables.MORALIS_APP_ID,
    });

    const user = await Moralis.authenticate({
      signingMessage: 'Sign message to authenticate',
    });

    const file = new Moralis.File('metadata.json', {
      base64: window.btoa(JSON.stringify(nftMetadata)),
    });

    await file.saveIPFS();

    const res = await (
      Moralis.Plugins as {
        rarible: {
          lazyMint: (args: {
            chain: string;
            userAddress: string;
            tokenType: string;
            tokenUri: string;
          }) => Promise<{
            data: {
              result: {
                tokenId: string;
                tokenAddress: string;
              };
            };
          }>;
        };
      }
    ).rarible.lazyMint({
      chain: EnvironmentVariables.WEB3_NET,
      userAddress: user.get('ethAddress') as string,
      tokenType: 'ERC721',
      tokenUri: '/ipfs/' + (file as unknown as { hash: () => string }).hash(),
    });

    return api.updateTerritoryRaribleMetadata({
      territoryId,
      data: {
        tokenId: res.data.result.tokenId,
        tokenAddress: res.data.result.tokenAddress,
      },
    });
  };

  return mintTerritory;
}
