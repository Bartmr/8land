import { Layout } from 'src/components/routing/layout/layout';
import { LinkAnchor } from 'src/components/ui-kit/protons/link-anchor/link-anchor';
import { EnvironmentVariables } from 'src/logic/app-internals/runtime/environment-variables';
import { TERRITORIES_ROUTE } from '../../client-side/territories/territories-routes';
import { USER_ROUTE } from '../../client-side/user/user-routes';
import { ACQUIRING_TERRITORIES_ROUTE } from './acquiring-territories-routes';
import image1 from './image-1.jpg';
import image2 from './image-2.jpg';
import image3 from './image-3.jpg';

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
              <p>
                8Land territories are represented by NFTs. That means that they
                can be exchanged exactly in the same way other NFTs do. You can
                get a territory by exchanging with somebody who already has one,
                or buy one directly from 8Land{' '}
                <LinkAnchor href={EnvironmentVariables.OPENSEA_STORE_URL}>
                  here
                </LinkAnchor>
                .
              </p>
              <p>
                8Land territory NFTs have useful information as attributes, like
                the size and location of said territory.
              </p>
            </li>
            <li className="mb-4">
              <div className="mt-3 alert alert-warning">
                {
                  "Before you buy a territory NFT it's important to check if the NFT \
was created by 8Land"
                }
              </div>
              <p>
                NFTs created by 8Land have the{' '}
                <span className="text-highlight">8LT</span> symbol and were
                created by the contract address{' '}
                <span className="text-highlight text-success">
                  {EnvironmentVariables.TERRITORIES_CONTRACT_ADDRESS}
                </span>
              </p>
              {/* TODO replace with production address */}
              <p>
                (The pictures below are just an example, and are not showing the
                real address. The real address is the one above.)
              </p>
              <div>
                <img src={image1} className="w-75" alt={'1'} />
              </div>
              <div className="mt-4">
                <img src={image2} className="w-75" alt={'2'} />
              </div>
            </li>
            <li className="mb-4">
              After you bought or received a territory, it should be listed{' '}
              <LinkAnchor href={TERRITORIES_ROUTE.getHref()}>here</LinkAnchor>
              <div className="mt-4">
                <img src={image3} className="w-75" alt={'2'} />
              </div>
            </li>
          </ol>
        </>
      )}
    </Layout>
  );
}
