import { GetTrainDestinationsDTO } from '@app/shared/train/apps/tickets/get-destinations/get-train-destinations.dto';
import { useEffect, useState } from 'react';
import { AppLayout } from 'src/components/routing/layout/app-layout';
import { TransportedDataGate } from 'src/components/shared/transported-data-gate/transported-data-gate';
import {
  TransportedData,
  TransportedDataStatus,
} from 'src/logic/app-internals/transports/transported-data/transported-data-types';
import { useTrainAPI } from 'src/logic/train/train.api';
import { AppContext } from '../../client-side/index/components/components/screens/app/app-screen.types';
import { AppContextProvider, useAppContext } from '../app-context';
import InfiniteScroll from 'react-infinite-scroll-component';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';

function Content(props: { appContext: AppContext }) {
  const trainsApi = useTrainAPI();

  const [searchQuery, replaceSearchQuery] = useState('');

  const [lastTotal, replaceLastTotal] = useState<number | undefined>();

  const [destinations, replaceDestinations] = useState<
    TransportedData<GetTrainDestinationsDTO['rows']>
  >({ status: TransportedDataStatus.NotInitialized });

  const [selectedWorldId, replaceSelectedWorldId] = useState<
    string | undefined
  >();

  const fetchDestinations = async (args?: { reset?: boolean }) => {
    if (args?.reset || !destinations.data) {
      replaceLastTotal(undefined);
      replaceDestinations({
        status: TransportedDataStatus.Loading,
      });
    } else {
      replaceDestinations({
        status: TransportedDataStatus.Refreshing,
        data: destinations.data,
      });
    }

    const res = await trainsApi.searchDestinations({
      skip: destinations.data?.length ?? 0,
      searchQuery,
    });

    if (res.failure) {
      replaceDestinations({ status: res.failure });
    } else {
      replaceDestinations({
        status: TransportedDataStatus.Done,
        data: [...(destinations.data ?? []), ...res.response.body.rows],
      });

      replaceLastTotal(res.response.body.total);
    }
  };

  useEffect(() => {
    replaceSelectedWorldId(
      trainsApi.getTrainDestination({
        currentStationLandId: props.appContext.land.id,
      }) ?? undefined,
    );

    (async () => {
      await fetchDestinations({ reset: true });
    })();
  }, [searchQuery]);

  return (
    <div className="py-4 container">
      <h1 className="h3 text-center">Welcome. Please pick a destination:</h1>
      <input
        value={searchQuery}
        onChange={(e) => replaceSearchQuery(e.target.value)}
        className="form-control"
        placeholder="Search for land by name"
      />
      {selectedWorldId ? (
        <p className="text-success">
          Destination is picked. Go throught the station gates to board
        </p>
      ) : null}
      <TransportedDataGate className="mt-3" dataWrapper={destinations}>
        {({ data }) => {
          return (
            <InfiniteScroll
              dataLength={data.length}
              next={() => fetchDestinations()}
              hasMore={Boolean(
                !(
                  [
                    TransportedDataStatus.Loading,
                    TransportedDataStatus.Refreshing,
                  ] as string[]
                ).includes(destinations.status) ||
                  lastTotal == null ||
                  destinations.data == null ||
                  destinations.data.length < lastTotal,
              )}
              loader={
                (
                  [
                    TransportedDataStatus.Loading,
                    TransportedDataStatus.Refreshing,
                  ] as string[]
                ).includes(destinations.status) ? (
                  <span className="d-block text-center">Loading...</span>
                ) : null
              }
              endMessage={
                <span className="d-block muted text-center">
                  There are no more destinations
                </span>
              }
            >
              {data.length === 0 ? (
                <span className="d-block text-center">{'No results :('}</span>
              ) : (
                <ul className="list-unstyled">
                  {data.map((destination) => {
                    return (
                      <li
                        key={destination.worldId}
                        className="p-3 d-flex justify-content-between align-items-center"
                      >
                        <span>{destination.name}</span>
                        <button
                          className={`btn btn-${
                            selectedWorldId === destination.worldId
                              ? 'success'
                              : 'info'
                          }`}
                        >
                          {selectedWorldId === destination.worldId ? (
                            <>
                              <FontAwesomeIcon icon={faCheck} /> Picked
                            </>
                          ) : (
                            'Pick'
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </InfiniteScroll>
          );
        }}
      </TransportedDataGate>
    </div>
  );
}

function LoadingGate() {
  const appContext = useAppContext();

  return (
    <TransportedDataGate dataWrapper={appContext}>
      {({ data }) => <Content appContext={data} />}
    </TransportedDataGate>
  );
}

export function TrainTicketMachineTemplate() {
  return (
    <AppContextProvider>
      <AppLayout>
        {() => {
          return <LoadingGate />;
        }}
      </AppLayout>
    </AppContextProvider>
  );
}
