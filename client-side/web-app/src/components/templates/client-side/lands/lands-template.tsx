import {
  IndexLandsDTO,
  IndexLandsQueryDTO,
} from '@app/shared/land/index/index-lands.dto';
import { useEffect, useState } from 'react';
import { TransportedDataGate } from 'src/components/shared/transported-data-gate/transported-data-gate';
import {
  TransportedData,
  TransportedDataStatus,
} from 'src/logic/app-internals/transports/transported-data/transported-data-types';
import { RouteComponentProps } from '@reach/router';
import { useMainJSONApi } from 'src/logic/app-internals/apis/main/use-main-json-api';
import { Logger } from 'src/logic/app-internals/logging/logger';
import { TransportFailure } from 'src/logic/app-internals/transports/transported-data/transport-failures';
import { Layout } from 'src/components/routing/layout/layout';
import { LANDS_ROUTE } from './lands-routes';
import { CreateLandRequestDTO } from '@app/shared/land/create/create-land.dto';
import { ToIndexedType } from '@app/shared/internals/transports/dto-types';
import { LinkAnchor } from 'src/components/ui-kit/protons/link-anchor/link-anchor';
import { EDIT_LAND_ROUTE } from './edit/edit-land-routes';

export function LandsTemplate(_props: RouteComponentProps) {
  const api = useMainJSONApi();

  const [newLandName, replaceNewLandName] = useState('');

  const [newLandSubmission, replaceNewLandSubmission] = useState<
    TransportedData<undefined | 'name-already-taken'>
  >({
    status: TransportedDataStatus.Done,
    data: undefined,
  });

  const [lands, replaceLands] = useState<TransportedData<IndexLandsDTO>>({
    status: TransportedDataStatus.NotInitialized,
  });

  const fetchLands = async () => {
    replaceLands({ status: TransportedDataStatus.Loading });

    const res = await api.get<
      { status: 200; body: ToIndexedType<IndexLandsDTO> },
      ToIndexedType<IndexLandsQueryDTO>
    >({
      path: '/lands',
      query: {
        skip: 0,
      },
      acceptableStatusCodes: [200],
    });

    if (res.failure) {
      replaceLands({
        status: res.failure,
      });
    } else {
      if (res.response.body.total > res.response.body.limit) {
        Logger.logError('lands-page-needs-pagination', new Error());

        replaceLands({
          status: TransportFailure.UnexpectedResponse,
        });
      } else {
        replaceLands({
          status: TransportedDataStatus.Done,
          data: res.response.body,
        });
      }
    }
  };

  const addLand = async () => {
    const confirmed = window.confirm(
      `Do you want to create a new land called "${newLandName}"`,
    );

    if (!confirmed) {
      return;
    }

    replaceNewLandSubmission({ status: TransportedDataStatus.Loading });

    const res = await api.post<
      | { status: 201; body: undefined }
      | { status: 409; body: { error: 'name-already-taken' } },
      undefined,
      ToIndexedType<CreateLandRequestDTO>
    >({
      path: '/lands',
      query: undefined,
      acceptableStatusCodes: [201, 409],
      body: {
        name: newLandName,
      },
    });

    if (res.failure) {
      replaceNewLandSubmission({
        status: res.failure,
      });
    } else {
      if (res.response.body?.error) {
        replaceNewLandSubmission({
          status: TransportedDataStatus.Done,
          data: res.response.body.error,
        });
      } else {
        replaceNewLandSubmission({
          status: TransportedDataStatus.Done,
          data: undefined,
        });

        replaceNewLandName('');

        await fetchLands();
      }
    }
  };

  useEffect(() => {
    (async () => {
      await fetchLands();
    })();
  }, []);

  return (
    <Layout title={LANDS_ROUTE.label}>
      {() => (
        <>
          <h1>Lands</h1>
          <TransportedDataGate dataWrapper={newLandSubmission}>
            {({ data }) => {
              return (
                <div className="d-flex mb-5">
                  <div className="form-group flex-fill">
                    <input
                      value={newLandName}
                      onChange={(e) => replaceNewLandName(e.target.value)}
                      placeholder="New land name"
                      id="add-land-name-input"
                      className={`form-control ${data ? 'is-invalid' : ''}`}
                    />
                    {data === 'name-already-taken' ? (
                      <div className="invalid-feedback position-absolute">
                        This name is already taken
                      </div>
                    ) : null}
                  </div>
                  <button
                    disabled={!newLandName.trim()}
                    onClick={addLand}
                    className="btn btn-success"
                  >
                    Add Land
                  </button>
                </div>
              );
            }}
          </TransportedDataGate>
          <hr />
          <TransportedDataGate dataWrapper={lands}>
            {({ data }) => {
              return (
                <div className="list-group">
                  {data.lands.map((land) => {
                    return (
                      <LinkAnchor
                        href={EDIT_LAND_ROUTE.getHref(land.id)}
                        key={land.id}
                        className="list-group-item d-flex justify-content-between"
                      >
                        <span>{land.name}</span>{' '}
                        {land.published ? (
                          <span className="badge bg-success">Published</span>
                        ) : null}
                      </LinkAnchor>
                    );
                  })}
                </div>
              );
            }}
          </TransportedDataGate>
        </>
      )}
    </Layout>
  );
}
