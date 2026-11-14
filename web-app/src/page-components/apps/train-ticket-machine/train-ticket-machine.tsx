import React from 'react';
import { GetTrainDestinationsDTO } from '../../../api/routes/train/train-api';
import { useEffect, useState } from 'react';
import { AppLayout } from '../app-layout';
import { CommunicationError } from '../../../communication-errors/communication-errors';
import { useTrainAPI } from '../../../api/routes/train/train-api';
import { AppContext } from '../../client/index/screens/app/app-screen-types';
import { AppContextProvider, useAppContext } from '../app-context';
import InfiniteScroll from 'react-infinite-scroll-component';
import {
  FaCheck,
  FaExclamationCircle,
  FaWifi,
} from 'react-icons/fa';

function Content(props: { appContext: AppContext }) {
  const trainsApi = useTrainAPI();

  const [searchQuery, replaceSearchQuery] = useState('');

  const [lastTotal, replaceLastTotal] = useState<number | undefined>();

  const [destinations, replaceDestinations] = useState<{
    loading?: boolean;
    error?: CommunicationError;
    data?: GetTrainDestinationsDTO['rows'];
  }>({});

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
        loading: true,
      });
    } else {
      replaceDestinations({
        loading: true,
        data: destinations.data,
      });
    }

    const res = await trainsApi.searchDestinations({
      skip: destinations.data?.length ?? 0,
      searchQuery,
    });

    if (res.error) {
      replaceDestinations({ error: res.error });
    } else {
      replaceDestinations({
        data: [...(destinations.data ?? []), ...res.response.body.rows],
      });

      replaceLastTotal(res.response.body.total);
    }
  };

  useEffect(() => {
    if (
      !destinations.loading &&
      !destinations.error &&
      destinations.data === undefined
    ) {
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
      <div className=" mt-3">
        {destinations.loading && destinations.data === undefined ? (
          <div className="d-flex flex-column justify-content-center align-items-center">
            <div
              className="d-block spinner-lg spinner-border text-primary"
              role="status"
            >
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : null}
        {destinations.loading && destinations.data !== undefined ? (
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
        {destinations.error === CommunicationError.ConnectionFailure ? (
          <div className="d-flex flex-column justify-content-center align-items-center">
            <FaWifi className="text-danger" style={{ fontSize: '2rem' }} />
            <p className="mt-3 text-center text-danger mb-0">
              No Internet. Check your connection and try again.
            </p>
          </div>
        ) : destinations.error === CommunicationError.AbortedAndDealtWith ? (
          <div className="d-flex flex-column justify-content-center align-items-center">
            <p className="mt-3 text-center mb-0">Redirecting...</p>
          </div>
        ) : destinations.error === CommunicationError.UnexpectedResponse ? (
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
        {destinations.data !== undefined && !destinations.error ? (
          <InfiniteScroll
            dataLength={destinations.data.length}
            next={() => fetchDestinations()}
            hasMore={
              lastTotal != null && destinations.data.length < lastTotal
            }
            loader={
              destinations.loading ? (
                <span className="d-block text-center">Loading...</span>
              ) : null
            }
            endMessage={
              <span className="d-block text-muted text-center">
                There are no more destinations
              </span>
            }
          >
            {destinations.data.length === 0 ? (
              <span className="d-block text-center">{'No results :('}</span>
            ) : (
              <ul className="list-unstyled">
                {destinations.data.map((destination) => {
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
                            <FaCheck /> Picked
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
        ) : null}
      </div>
    </div>
  );
}

function LoadingGate() {
  const appContext = useAppContext();

  return (
    <div className=" ">
      {appContext.loading && appContext.data === undefined ? (
        <div className="d-flex flex-column justify-content-center align-items-center">
          <div
            className="d-block spinner-lg spinner-border text-primary"
            role="status"
          >
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : null}
      {appContext.loading && appContext.data !== undefined ? (
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
      {appContext.error === CommunicationError.ConnectionFailure ? (
        <div className="d-flex flex-column justify-content-center align-items-center">
          <FaWifi className="text-danger" style={{ fontSize: '2rem' }} />
          <p className="mt-3 text-center text-danger mb-0">
            No Internet. Check your connection and try again.
          </p>
        </div>
      ) : appContext.error === CommunicationError.AbortedAndDealtWith ? (
        <div className="d-flex flex-column justify-content-center align-items-center">
          <p className="mt-3 text-center mb-0">Redirecting...</p>
        </div>
      ) : appContext.error === CommunicationError.UnexpectedResponse ? (
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
      {appContext.data !== undefined && !appContext.error ? (
        <Content appContext={appContext.data} />
      ) : null}
    </div>
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
