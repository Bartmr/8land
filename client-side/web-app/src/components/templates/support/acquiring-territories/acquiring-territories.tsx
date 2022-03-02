import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';
import { Layout } from 'src/components/routing/layout/layout';
import { LinkAnchor } from 'src/components/ui-kit/protons/link-anchor/link-anchor';
import { EnvironmentVariables } from 'src/logic/app-internals/runtime/environment-variables';
import { TerritoryAuthenticitySection } from '../../client-side/territories/territory-authenticity-section';
import { USER_ROUTE } from '../../client-side/user/user-routes';
import { ACQUIRING_TERRITORIES_ROUTE } from './acquiring-territories-routes';

// TODO update for rarible

// should have an input box where you put a rarible url and it tells you if its a valid territory

export function AcquiringTerritoriesTemplate() {
  const [isTerritoryNFT, replaceIsTerritoryNFT] = useState<
    undefined | boolean
  >();

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
                can be exchanged exactly in the same way other NFTs are. You can
                get a territory and its NFT by buying one directly from 8Land or
                exchanging with somebody who already has one.{' '}
                <LinkAnchor href={EnvironmentVariables.TERRITORIES_STORE_URL}>
                  Click here to see all 8Land territories available out there
                </LinkAnchor>
                .
              </p>
              <p>
                8Land territory NFTs have useful information as attributes, like
                the size and location of said territory.
              </p>
            </li>
            <li>
              <p>
                <span className="text-warning">
                  If you are buying a territory NFT from someone other than
                  8Land, it&apos;s important to check it&apos;s authenticity!
                </span>
              </p>
              <p>
                Paste the Rarible territory NFT URL here to check if it&apos;s
                an authentic 8Land territory NFT
              </p>
              <p className="text-muted">
                Rarible NFT URLs generally start with{' '}
                {EnvironmentVariables.RARIBLE_URL}/token
              </p>
              <TerritoryAuthenticitySection
                buttonLabel="Validate NFT"
                onResult={(r) => {
                  replaceIsTerritoryNFT(
                    r.status === 'not-owned' || r.status === 'owned',
                  );
                }}
              />
              <div className="mt-3">
                {isTerritoryNFT === true ? (
                  <div className="alert alert-success">
                    This NFT is a valid 8Land Territory NFT
                  </div>
                ) : null}
                {isTerritoryNFT === false ? (
                  <div className="alert alert-danger">
                    <FontAwesomeIcon
                      icon={faExclamationTriangle}
                    ></FontAwesomeIcon>{' '}
                    This NFT is{' '}
                    <span style={{ textDecoration: 'underline' }}>NOT</span> an
                    authentic 8Land Territory NFT.
                  </div>
                ) : null}
              </div>
            </li>
          </ol>
        </>
      )}
    </Layout>
  );
}
