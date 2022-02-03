import { ToIndexedType } from '@app/shared/internals/transports/dto-types';
import { TerritoryFromIndex } from '@app/shared/territories/index/index-territories.dto';
import { RouteComponentProps } from '@reach/router';
import { useEffect, useState } from 'react';
import { Layout } from 'src/components/routing/layout/layout';
import { TransportedDataGate } from 'src/components/shared/transported-data-gate/transported-data-gate';
import { LinkAnchor } from 'src/components/ui-kit/protons/link-anchor/link-anchor';
import { useMainJSONApi } from 'src/logic/app-internals/apis/main/use-main-json-api';
import {
  TransportedData,
  TransportedDataStatus,
} from 'src/logic/app-internals/transports/transported-data/transported-data-types';
import { EDIT_TERRITORY_ROUTE } from './edit/edit-territory-routes';
import { TERRITORIES_ROUTE } from './territories-routes';

function TerritoriesTemplateContent() {
  const api = useMainJSONApi();

  const [territories, replaceTerritories] = useState<
    TransportedData<TerritoryFromIndex[]>
  >({ status: TransportedDataStatus.NotInitialized });

  const fetchTerritories = async () => {
    replaceTerritories({ status: TransportedDataStatus.Loading });

    const res = await api.get<
      { status: 200; body: ToIndexedType<TerritoryFromIndex[]> },
      undefined
    >({
      path: '/territories',
      acceptableStatusCodes: [200],
      query: undefined,
    });

    if (res.failure) {
      replaceTerritories({
        status: res.failure,
      });
    } else {
      replaceTerritories({
        status: TransportedDataStatus.Done,
        data: res.response.body,
      });
    }
  };

  useEffect(() => {
    (async () => {
      await fetchTerritories();
    })();
  }, []);

  return (
    <>
      <h1>My Territories</h1>
      <TransportedDataGate dataWrapper={territories}>
        {({ data }) => {
          return (
            <div className="list-group">
              {data.map((territory) => {
                return (
                  <LinkAnchor
                    href={EDIT_TERRITORY_ROUTE.getHref(territory.id)}
                    key={territory.id}
                    className="list-group-item d-flex justify-content-between"
                  >
                    <span>{territory.name}</span>
                  </LinkAnchor>
                );
              })}
            </div>
          );
        }}
      </TransportedDataGate>
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
