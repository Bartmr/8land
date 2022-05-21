import { Layout } from 'src/components/routing/layout/layout';
import { EDIT_LAND_ROUTE } from './edit-land-routes';
import { RouteComponentProps } from '@reach/router';
import { AssetsSection } from './components/assets-section/assets-section';
import { useEffect, useState } from 'react';
import {
  TransportedData,
  TransportedDataStatus,
} from 'src/logic/app-internals/transports/transported-data/transported-data-types';
import { GetLandDTO } from '@app/shared/land/get/get-land.dto';
import { TransportedDataGate } from 'src/components/shared/transported-data-gate/transported-data-gate';
import { useParams } from '@reach/router';
import { object } from 'not-me/lib/schemas/object/object-schema';
import { uuid } from '@app/shared/internals/validation/schemas/uuid.schema';
import { useLandsAPI } from 'src/logic/lands/lands-api';
import { Toast } from 'react-bootstrap';
import { MainSection } from './components/main-section/main-section';
import { BlocksSection } from './components/blocks-section/blocks-section';
import { TerritoriesSection } from './components/territories-section/territories-section';
import { TransportFailure } from 'src/logic/app-internals/transports/transported-data/transport-failures';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { navigate } from 'gatsby';
import { LANDS_ROUTE } from '../lands-routes';

export function EditLandTemplateWithRouteProps(props: { id: string }) {
  const api = useLandsAPI();

  const [land, replaceLand] = useState<TransportedData<GetLandDTO>>({
    status: TransportedDataStatus.NotInitialized,
  });

  const [deleteResult, replaceDeleteResult] = useState<
    TransportedData<undefined>
  >({
    status: TransportedDataStatus.NotInitialized,
  });

  const [successfulSave, replaceSuccessfulSave] = useState(false);

  const deleteLand = async () => {
    const confirmed = window.confirm(
      `Are you sure you want do delete this land named ${
        land.data?.name || ''
      }?`,
    );

    if (confirmed) {
      replaceDeleteResult({ status: TransportedDataStatus.Loading });

      const res = await api.deleteLand({ landId: props.id });

      if (res.failure) {
        replaceDeleteResult({ status: res.failure });
      } else {
        if (res.response.status === 'must-delete-blocks-first') {
          window.alert(
            'You must delete all blocks in this land and all other blocks pointing to it before can delete this land.',
          );

          replaceDeleteResult({
            status: TransportedDataStatus.Done,
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
    replaceLand({ status: TransportedDataStatus.Loading });

    const res = await api.getEditableLand({ landId: props.id });

    if (res.failure) {
      replaceLand({ status: res.failure });
    } else {
      replaceLand({
        status: TransportedDataStatus.Done,
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
      <TransportedDataGate dataWrapper={land}>
        {({ data }) => {
          return (
            <>
              <div className="mb-4 d-flex justify-content-end">
                <button
                  onClick={deleteLand}
                  disabled={!land.data || land.data.isStartLand}
                  className="btn btn-danger"
                >
                  {deleteResult.status === TransportedDataStatus.Loading ? (
                    <span className="spinner-border spinner-sm" />
                  ) : (
                    <FontAwesomeIcon icon={faTrash} />
                  )}{' '}
                  {land.data?.isStartLand
                    ? 'Cannot delete lands with start block'
                    : 'Delete land'}
                </button>
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
              <div className="mt-4">
                <TerritoriesSection
                  land={data}
                  onSuccessfulSave={onSuccessfulSave}
                />
              </div>
            </>
          );
        }}
      </TransportedDataGate>
    </>
  );
}

export function EditLandTemplate(_props: RouteComponentProps) {
  const routeParams = useParams() as unknown;

  const validationResult = object({
    id: uuid().required(),
  })
    .required()
    .validate(routeParams);

  return (
    <Layout title={EDIT_LAND_ROUTE.label}>
      {() => {
        return validationResult.errors ? (
          <TransportedDataGate
            dataWrapper={{ status: TransportFailure.NotFound }}
          >
            {() => null}
          </TransportedDataGate>
        ) : (
          <EditLandTemplateWithRouteProps id={validationResult.value.id} />
        );
      }}
    </Layout>
  );
}
