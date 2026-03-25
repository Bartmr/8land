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

  const [selectedWorld, replaceSelectedWorld] = useState<
    { name: string; worldId: string } | undefined
  >(
    trainsApi.getTrainDestination({
      currentStationLandId: props.appContext.land.id,
    }) ?? undefined,
  );

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
    if (destinations.status === TransportedDataStatus.NotInitialized) {
      (async () => {
        await fetchDestinations({ reset: true });
      })();

      return;
    } else {
      const timeout = window.setTimeout(() => {
        (async () => {
          await fetchDestinations({ reset: true });
        })();
      }, 300);

      return () => {
        window.clearTimeout(timeout);
      };
    }
  }, [searchQuery]);

  return (
    <div className="py-2 container">
      <h1 className="h3 text-center">Welcome. Please pick a destination:</h1>
      <input
        value={searchQuery}
        onChange={(e) => replaceSearchQuery(e.target.value)}
        className="form-control form-control-sm"
        placeholder="Search for land by name"
      />
      {selectedWorld ? (
        <p className="bg-success mt-1">
          Destination: {selectedWorld.name}
          <br />
          Go throught the station gates to board
        </p>
      ) : null}
      <TransportedDataGate className="mt-3" dataWrapper={destinations}>
        {({ data }) => {
          return (
            <InfiniteScroll
              dataLength={data.length}
              next={() => fetchDestinations()}
              hasMore={lastTotal != null && data.length < lastTotal}
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
                <span className="d-block text-muted text-center">
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
                        className="py-2 d-flex justify-content-between align-items-center"
                      >
                        <span>{destination.name}</span>
                        <button
                          onClick={() => {
                            replaceSelectedWorld({
                              name: destination.name,
                              worldId: destination.worldId,
                            });

                            trainsApi.setTrainDestination({
                              destinationWorldName: destination.name,
                              destinationWorldId: destination.worldId,
                              currentStationLandId: props.appContext.land.id,
                            });
                          }}
                          className={`btn btn-sm btn-${
                            selectedWorld?.worldId === destination.worldId
                              ? 'success'
                              : 'info'
                          }`}
                        >
                          {selectedWorld?.worldId === destination.worldId ? (
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
