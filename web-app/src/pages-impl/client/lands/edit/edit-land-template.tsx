import React from 'react';
import { Layout } from '../../../layout/layout';
import { RouteComponentProps } from '@reach/router';
import { AssetsSection } from './assets-section/assets-section';
import { useEffect, useState } from 'react';
import {
  CommunicatedData,
  CommunicatedDataStatus,
} from '../../../../communicated-data/communicated-data-types';
import { GetLandDTO } from '../../../../main-api/routes/lands/lands.dtos';
import { CommunicatedDataGate } from '../../../../ui/communicated-data-gate';
import { useParams } from '@reach/router';
import { uuid, z } from 'zod';
import { useLandsAPI } from '../../../../main-api/routes/lands/lands-api';
import { Toast } from 'react-bootstrap';
import { MainSection } from './main-section/main-section';
import { BlocksSection } from './blocks-section/blocks-section';
import { CommunicationError } from '../../../../communication-errors/communication-errors';
import { FaTrash } from 'react-icons/fa';
import { navigate } from 'gatsby';
import { LANDS_ROUTE } from '../lands-routes';
// import { useStoreSelector } from '../../../../store/use-store-selector';
// import { throwError } from '@shared/src/internals/utils/throw-error';
// import { Role } from '@shared/src/auth/auth.enums';

export function EditLandTemplateWithRouteProps(props: { id: string }) {
  const api = useLandsAPI();

  const [land, replaceLand] = useState<CommunicatedData<GetLandDTO>>({
    status: CommunicatedDataStatus.NotInitialized,
  });

  const [deleteResult, replaceDeleteResult] = useState<
    CommunicatedData<undefined>
  >({
    status: CommunicatedDataStatus.NotInitialized,
  });

  const [successfulSave, replaceSuccessfulSave] = useState(false);

  const deleteLand = async () => {
    const confirmed = window.confirm(
      `Are you sure you want do delete this land named ${
        land.data?.name || ''
      }?`,
    );

    if (confirmed) {
      replaceDeleteResult({ status: CommunicatedDataStatus.Loading });

      const res = await api.deleteLand({ landId: props.id });

      if (res.error) {
        replaceDeleteResult({ status: res.error });
      } else {
        if (res.response.status === 'must-delete-blocks-first') {
          window.alert(
            'You must delete all blocks in this land and all other blocks pointing to it before can delete this land.',
          );

          replaceDeleteResult({
            status: CommunicatedDataStatus.Done,
            data: undefined,
          });
        } else {
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          navigate(LANDS_ROUTE.getHref({ deleted: true }));
        }
      }
    }
  };

  const fetchLand = async () => {
    replaceLand({ status: CommunicatedDataStatus.Loading });

    const res = await api.getEditableLand({ landId: props.id });

    if (res.error) {
      replaceLand({ status: res.error });
    } else {
      replaceLand({
        status: CommunicatedDataStatus.Done,
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
        show={successfulSave}
        delay={10000}
        autohide
      >
        <Toast.Header closeButton={false}>Changes saved</Toast.Header>
      </Toast>
      <CommunicatedDataGate dataWrapper={land}>
        {({ data }) => {
          return (
            <>
              <div className="mb-4 d-flex justify-content-between align-items-center flex-wrap">
                <h1 className="mb-0">Edit Land</h1>
                <div>
                  <button
                    onClick={deleteLand}
                    disabled={!land.data || land.data.isStartLand}
                    className="btn btn-danger"
                  >
                    {deleteResult.status === CommunicatedDataStatus.Loading ? (
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
              <MainSection onSuccessfulSave={onSuccessfulSave} land={data} />
              <div className="mt-4">
                <BlocksSection
                  onBlockDeleted={onSuccessfulSave}
                  onBlockCreated={onSuccessfulSave}
                  land={data}
                />
              </div>
              <div className="mt-4">
                <AssetsSection
                  onSuccessfulSave={onSuccessfulSave}
                  land={data}
                />
              </div>
            </>
          );
        }}
      </CommunicatedDataGate>
    </>
  );
}

export function EditLandTemplate(_props: RouteComponentProps) {
  const routeParams = useParams() as unknown;

  const validationResult = z.object({
    id: uuid(),
  }).safeParse(routeParams);

  return (
    <Layout>
      {() => {
        return !validationResult.success ? (
          <CommunicatedDataGate
            dataWrapper={{ status: CommunicationError.NotFound }}
          >
            {() => null}
          </CommunicatedDataGate>
        ) : (
          <EditLandTemplateWithRouteProps id={validationResult.data.id} />
        );
      }}
    </Layout>
  );
}
