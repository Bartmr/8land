import { throwError } from '@app/shared/internals/utils/throw-error';
import { RouteComponentProps } from '@reach/router';
import { useState } from 'react';
import { Layout } from 'src/components/routing/layout/layout';
import { mainApiReducer } from 'src/logic/app-internals/apis/main/main-api-reducer';
import { EnvironmentVariables } from 'src/logic/app-internals/runtime/environment-variables';
import { useStoreSelector } from 'src/logic/app-internals/store/use-store-selector';
import { TERRITORIES_ROUTE } from './territories-routes';
import { LinkAnchor } from 'src/components/ui-kit/protons/link-anchor/link-anchor';
import { USER_ROUTE } from '../user/user-routes';
import { TerritoryAuthenticitySection } from './territory-authenticity-section';
import { navigate } from 'gatsby';
import { EDIT_TERRITORY_ROUTE } from './edit/edit-territory-routes';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamation, faInfo } from '@fortawesome/free-solid-svg-icons';

function TerritoriesTemplateContent() {
  const session = useStoreSelector(
    { mainApi: mainApiReducer },
    (s) => s.mainApi.session.data || throwError(),
  );

  const [error, replaceError] = useState<
    undefined | 'not-found' | 'not-owned'
  >();

  return (
    <>
      <p className="lead">
        To edit your territory, please paste your 8Land NFT{' '}
        <span className="text-warning">Rarible URL</span>
      </p>
      <p className="text-muted">
        You need to own the territory NFT in order to build / edit it.{' '}
        <LinkAnchor href={EnvironmentVariables.TERRITORIES_STORE_URL}>
          Click here to get territory NFTs
        </LinkAnchor>
      </p>
      {session.walletAddress ? (
        <div>
          <span className="text-muted">
            Currently connected to wallet{' '}
            <span className="text-success">{session.walletAddress}</span>
          </span>
          <TerritoryAuthenticitySection
            buttonLabel="Validate NFT"
            onResult={async (r) => {
              if (r.status === 'owned') {
                await navigate(EDIT_TERRITORY_ROUTE.getHref(r.id));
              } else {
                replaceError(r.status);
              }
            }}
          />
          {error === 'not-found' ? (
            <p className="mt-3 text-info">
              <FontAwesomeIcon icon={faInfo} /> This Rarible URL does not point
              to an existing territory.
            </p>
          ) : null}{' '}
          {error === 'not-owned' ? (
            <p className="mt-3 text-warning">
              <FontAwesomeIcon icon={faExclamation} /> You cannot edit this
              territory since you currently don&apos;t own the NFT of it.
            </p>
          ) : null}
        </div>
      ) : (
        <p className="alert alert-warning">
          You need to connect your wallet to 8Land before proceeding{' '}
          <LinkAnchor className="alert-link" href={USER_ROUTE.getHref()}>
            Click here to connect your wallet to 8land
          </LinkAnchor>
        </p>
      )}
    </>
  );
}

export function TerritoriesTemplate(_props: RouteComponentProps) {
  return (
    <Layout title={TERRITORIES_ROUTE.title}>
      {() => <TerritoriesTemplateContent />}
    </Layout>
  );
}
