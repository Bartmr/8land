import React from 'react';
import { Layout } from '../../../layout/layout';
import { RouteComponentProps } from '@reach/router';
import { AssetsSection } from './assets-section/assets-section';
import { useEffect, useState } from 'react';
import { GetLandDTO } from '../../../../api/routes/lands/lands-api';
import { useParams } from '@reach/router';
import { uuid, z } from 'zod';
import { useLandsAPI } from '../../../../api/routes/lands/lands-api';
import { Toast } from 'react-bootstrap';
import { MainSection } from './main-section/main-section';
import { BlocksSection } from './blocks-section/blocks-section';
import { CommunicationError } from '../../../../communication-errors/communication-errors';
import {
  FaExclamationCircle,
  FaSearch,
  FaTrash,
  FaWifi,
} from 'react-icons/fa';
import { navigate } from 'gatsby';
import { LANDS_ROUTE } from '../lands-routes';
// import { useStoreSelector } from '../../../../store/use-store-selector';
// import { throwError } from '@shared/src/internals/utils/throw-error';
// import { Role } from '@shared/src/auth/auth.enums';

export function EditLandWithRouteProps(props: { id: string }) {
  const api = useLandsAPI();

  const [land, replaceLand] = useState<{
    loading?: boolean;
    error?: CommunicationError;
    data?: GetLandDTO;
  }>({});

  const [deleteResult, replaceDeleteResult] = useState<{
    loading?: boolean;
    error?: CommunicationError;
  }>({});

  const [successfulSave, replaceSuccessfulSave] = useState(false);

  const deleteLand = async () => {
    const confirmed = window.confirm(
      `Are you sure you want do delete this land named ${
        land.data?.name || ''
      }?`,
    );

    if (confirmed) {
      replaceDeleteResult({ loading: true });

      const res = await api.deleteLand({ landId: props.id });

      if (res.error) {
        replaceDeleteResult({ error: res.error });
      } else {
        if (res.response.status === 'must-delete-blocks-first') {
          window.alert(
            'You must delete all blocks in this land and all other blocks pointing to it before can delete this land.',
          );

          replaceDeleteResult({});
        } else {
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          navigate(LANDS_ROUTE.getHref({ deleted: true }));
        }
      }
    }
  };

  const fetchLand = async () => {
    replaceLand({ loading: true });

    const res = await api.getEditableLand({ landId: props.id });

    if (res.error) {
      replaceLand({ error: res.error });
    } else {
      replaceLand({
        data: res.response.body,
      });
    }
  };

  const onSuccessfulSave = async () => {
    replaceSuccessfulSave(true);

    await fetchLand();
  };

  useEffect(() => {
    (async () => {
      await fetchLand();
    })();
  }, [props.id]);

  return (
    <>
      <Toast
        className="bg-success w-100 mb-4"
        onClose={() => replaceSuccessfulSave(false)}
        show={true}
        // delay={10000}
        autohide
      >
        <Toast.Header closeButton={false}>Changes saved</Toast.Header>
      </Toast>
      <div className=" ">
        {land.loading && land.data === undefined ? (
          <div className="d-flex flex-column justify-content-center align-items-center">
            <div
              className="d-block spinner-lg spinner-border text-primary"
              role="status"
            >
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : null}
        {land.loading && land.data !== undefined ? (
          <div
            style={{
              zIndex: 1,
              right: 'var(--spacer-3)',
              position: 'fixed',
            }}
          >
            <div
              className="d-block spinner-lg spinner-border text-primary"
              role="status"
            >
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : null}
        {land.error === CommunicationError.ConnectionFailure ? (
          <div className="d-flex flex-column justify-content-center align-items-center">
            <FaWifi className="text-danger" style={{ fontSize: '2rem' }} />
            <p className="mt-3 text-center text-danger mb-0">
              No Internet. Check your connection and try again.
            </p>
          </div>
        ) : land.error === CommunicationError.AbortedAndDealtWith ? (
          <div className="d-flex flex-column justify-content-center align-items-center">
            <p className="mt-3 text-center mb-0">Redirecting...</p>
          </div>
        ) : land.error === CommunicationError.UnexpectedResponse ? (
          <div className="d-flex flex-column justify-content-center align-items-center">
            <FaExclamationCircle
              className="text-danger"
              style={{ fontSize: '2rem' }}
            />
            <p className="text-danger mt-3 text-center mb-0">
              An unexpected error occurred. Try again later.
            </p>
          </div>
        ) : null}
        {land.data !== undefined && !land.error ? (
          <>
            <div className="mb-4 d-flex justify-content-between align-items-center flex-wrap">
              <h1 className="mb-0">Edit Land</h1>
              <div>
                <button
                  onClick={deleteLand}
                  disabled={!land.data || land.data.isStartLand}
                  className="btn btn-danger"
                >
                  {deleteResult.loading ? (
                    <span className="spinner-border spinner-sm" />
                  ) : (
                    <FaTrash />
                  )}{' '}
                  {land.data?.isStartLand
                    ? 'Cannot delete lands with start block'
                    : 'Delete land'}
                </button>
              </div>
            </div>
            <MainSection
              onSuccessfulSave={onSuccessfulSave}
              land={land.data}
            />
            <div className="mt-4">
              <BlocksSection
                onBlockDeleted={onSuccessfulSave}
                onBlockCreated={onSuccessfulSave}
                land={land.data}
              />
            </div>
            <div className="mt-4">
              <AssetsSection
                onSuccessfulSave={onSuccessfulSave}
                land={land.data}
              />
            </div>
          </>
        ) : null}
      </div>
    </>
  );
}

export function EditLand(_props: RouteComponentProps) {
  const routeParams = useParams() as unknown;

  const validationResult = z.object({
    id: uuid(),
  }).safeParse(routeParams);

  return (
    <Layout>
      {() => {
        return !validationResult.success ? (
          <div className=" ">
            <div className="d-flex flex-column justify-content-center align-items-center">
              <FaSearch style={{ fontSize: '2rem' }} />
              <p className="mt-3 text-center mb-0">Not Found</p>
            </div>
          </div>
        ) : (
          <EditLandWithRouteProps id={validationResult.data.id} />
        );
      }}
    </Layout>
  );
}
