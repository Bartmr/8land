import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Layout } from 'src/components/routing/layout/layout';
import { LinkAnchor } from 'src/components/ui-kit/protons/link-anchor/link-anchor';
import { EnvironmentVariables } from 'src/logic/app-internals/runtime/environment-variables';
import { TERRITORIES_ROUTE } from '../client-side/territories/territories-routes';
import { NFTS_ROUTE } from './nfts-routes';
import { faEdit, faLandmarkFlag } from '@fortawesome/free-solid-svg-icons';

export function NFTsTemplate() {
  return (
    <Layout title={NFTS_ROUTE.label}>
      {() => {
        return (
          <div
            className="d-flex flex-column justify-content-center bg-secondary"
            style={{ height: '80vh' }}
          >
            <div className="pb-4 d-flex flex-column align-items-center">
              <div className="d-flex align-items-center">
                <h1 className="display-1 text-body">NFT Territories</h1>
              </div>
              <div>
                <p className="mb-0 display-4 text-body text-center">
                  Help fund 8Land by buying a NFT territory, and get a spotlight
                  in the main land
                </p>
              </div>
              <div className="mt-4">
                <p className="mb-0 text-body text-center">
                  While anyone can create their own lands, owning a NFT
                  territory allows you to build on the main land.
                </p>
                <p className="mb-0 text-body text-center">
                  Like any other NFT, territory NFTs can later be exchanged, and
                  ownership of the territory can be transmitted.
                </p>
              </div>
              <hr style={{ width: '3rem' }}></hr>
              <div className="mt-3 w-100 row g-2 justify-content-center">
                <div className="col-12 col-md-4 col-lg-3">
                  <LinkAnchor
                    className="d-block btn btn-default"
                    href={TERRITORIES_ROUTE.getHref()}
                  >
                    <FontAwesomeIcon icon={faEdit} /> Edit my territories
                  </LinkAnchor>
                </div>
                <div className="col-12 col-md-5 col-lg-4">
                  <LinkAnchor
                    className="d-block btn btn-info"
                    href={EnvironmentVariables.TERRITORIES_STORE_URL}
                  >
                    <FontAwesomeIcon icon={faLandmarkFlag} /> Own a territory{' '}
                  </LinkAnchor>
                </div>
              </div>
            </div>
          </div>
        );
      }}
    </Layout>
  );
}
