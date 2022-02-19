import { Layout } from 'src/components/routing/layout/layout';
import { LinkAnchor } from 'src/components/ui-kit/protons/link-anchor/link-anchor';
import { EnvironmentVariables } from 'src/logic/app-internals/runtime/environment-variables';
import { USER_ROUTE } from '../../client-side/user/user-routes';
import { ACQUIRING_TERRITORIES_ROUTE } from './acquiring-territories-routes';

// TODO update for rarible

// should have an input box where you put a rarible url and it tells you if its a valid territory

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
                <LinkAnchor href={EnvironmentVariables.TERRITORIES_STORE_URL}>
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
              ! TO BE WRITTEN !
            </li>
          </ol>
        </>
      )}
    </Layout>
  );
}
