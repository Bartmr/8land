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
import NotFoundTemplate from 'src/pages/404';
import { useMainJSONApi } from 'src/logic/app-internals/apis/main/use-main-json-api';
import { ToIndexedType } from '@app/shared/internals/transports/dto-types';
import { Toast } from 'react-bootstrap';
import { MainSection } from './components/main-section/main-section';

export function EditLandTemplateWithRouteProps(props: { id: string }) {
  const api = useMainJSONApi();

  const [land, replaceLand] = useState<TransportedData<GetLandDTO>>({
    status: TransportedDataStatus.NotInitialized,
  });

  const [successfulSave, replaceSuccessfulSave] = useState(false);

  const fetchLand = async () => {
    replaceLand({ status: TransportedDataStatus.Loading });

    const res = await api.get<
      { status: 200; body: ToIndexedType<GetLandDTO> },
      undefined
    >({
      path: `/lands/${props.id}`,
      query: undefined,
      acceptableStatusCodes: [200],
    });

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
  }, []);

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
              <MainSection onSuccessfulSave={onSuccessfulSave} land={data} />
              <div className="mt-4">
                <AssetsSection
                  onSuccessfulSave={onSuccessfulSave}
                  land={data}
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
          <NotFoundTemplate />
        ) : (
          <EditLandTemplateWithRouteProps id={validationResult.value.id} />
        );
      }}
    </Layout>
  );
}
