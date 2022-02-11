import { Layout } from 'src/components/routing/layout/layout';
import { LinkAnchor } from 'src/components/ui-kit/protons/link-anchor/link-anchor';
import { EnvironmentVariables } from 'src/logic/app-internals/runtime/environment-variables';
import { USER_ROUTE } from '../../client-side/user/user-routes';
import { ACQUIRING_TERRITORIES_ROUTE } from './acquiring-territories-routes';
import image1 from './image-1.jpg';
import image2 from './image-2.jpg';

export function AcquiringTerritoriesTemplate() {
  return (
    <Layout title={ACQUIRING_TERRITORIES_ROUTE.title}>
      {() => (
        <>
          <h2>Acquiring Territories</h2>

          <ol>
            <li className="mb-4">
              Connect your Metamask wallet to 8land{' '}
              <LinkAnchor href={USER_ROUTE.getHref()}>here</LinkAnchor>
            </li>
            <li className="mb-4">
              8Land territories are represented by NFTs. That means that they
              can be exchanged exactly in the same way other NFTs do. You can
              get a territory by exchanging with somebody who already has one,
              or buy one directly to 8Land{' '}
              <LinkAnchor href={EnvironmentVariables.OPENSEA_STORE_URL}>
                here
              </LinkAnchor>
              .
              <br />
              <p className="mt-3 lead text-warning">
                {
                  "Before you buy a territory NFT it's important to see if the NFT\
was created by 8Land"
                }
              </p>
              <p>
                NFTs created by 8Land have the{' '}
                <span className="text-highlight">8LT</span> symbol and were
                created by the contract address{' '}
                <span className="text-highlight">
                  {EnvironmentVariables.TERRITORIES_CONTRACT_ADDRESS}
                </span>
              </p>
              <div>
                <img src={image1} className="w-75" alt={'1'} />
              </div>
              <div className="mt-4">
                <img src={image2} className="w-75" alt={'2'} />
              </div>
            </li>
          </ol>
        </>
      )}
    </Layout>
  );
}
