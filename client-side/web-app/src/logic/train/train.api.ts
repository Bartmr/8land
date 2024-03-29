import { ToIndexedType } from '@app/shared/internals/transports/dto-types';
import { uuid } from '@app/shared/internals/validation/schemas/uuid.schema';
import {
  GetTrainDestinationQueryDTO,
  GetTrainDestinationsDTO,
} from '@app/shared/train/apps/tickets/get-destinations/get-train-destinations.dto';
import { BoardTrainDTO } from '@app/shared/train/board/board-train.dto';
import {
  ReturnToTrainStationDTO,
  ReturnToTrainStationQueryDTO,
} from '@app/shared/train/return/return-to-train-station.dto';
import { object } from 'not-me/lib/schemas/object/object-schema';
import { string } from 'not-me/lib/schemas/string/string-schema';
import {
  mainApiReducer,
  MainApiStoreState,
} from '../app-internals/apis/main/main-api-reducer';
import {
  MainJSONApi,
  useMainJSONApi,
} from '../app-internals/apis/main/use-main-json-api';
import { useStoreGetState } from '../app-internals/store/use-store-get-state';
import { useLocalStorage } from '../app-internals/transports/use-local-storage';

export class TrainAPI {
  constructor(
    private api: MainJSONApi,
    private localStorage: ReturnType<typeof useLocalStorage>,
    private getMainApiStoreState: () => { mainApi: MainApiStoreState },
  ) {}

  getTrainDestination(args: { currentStationLandId: string }) {
    return this.localStorage.getItem(
      object({
        name: string().required(),
        worldId: uuid().required(),
      }),
      `train-destination:${args.currentStationLandId}`,
    );
  }

  setTrainDestination(args: {
    destinationWorldName: string;
    destinationWorldId: string;
    currentStationLandId: string;
  }) {
    return this.localStorage.setItem(
      `train-destination:${args.currentStationLandId}`,
      {
        name: args.destinationWorldName,
        worldId: args.destinationWorldId,
      },
    );
  }

  clearTrainDestination(args: { currentStationLandId: string }) {
    return this.localStorage.removeItem(
      `train-destination:${args.currentStationLandId}`,
    );
  }

  board(args: { worldId: string; boardingFromLand: string }) {
    this.localStorage.setItem('last-train-station', args.boardingFromLand);

    return this.api.get<
      { status: 200; body: ToIndexedType<BoardTrainDTO> },
      undefined
    >({
      path: `/train/board/${args.worldId}`,
      query: undefined,
      acceptableStatusCodes: [200],
    });
  }

  returnToTrainStation() {
    const query: ReturnToTrainStationQueryDTO = {};

    const session = this.getMainApiStoreState().mainApi.session.data;

    if (!session) {
      const returningTrainStationId = this.localStorage.getItem(
        uuid().required(),
        'last-train-station',
      );

      query.boardedOnTrainStation = returningTrainStationId;
    }

    return this.api.get<
      { status: 200; body: ToIndexedType<ReturnToTrainStationDTO> },
      ToIndexedType<ReturnToTrainStationQueryDTO>
    >({
      path: `/train/return`,
      query,
      acceptableStatusCodes: [200],
    });
  }

  searchDestinations(args: { skip: number; searchQuery: string }) {
    return this.api.get<
      { status: 200; body: ToIndexedType<GetTrainDestinationsDTO> },
      ToIndexedType<GetTrainDestinationQueryDTO>
    >({
      path: `/train/apps/tickets/getDestinations`,
      query: {
        skip: args.skip,
        name: args.searchQuery,
      },
      acceptableStatusCodes: [200],
    });
  }
}

export function useTrainAPI() {
  const api = useMainJSONApi();
  const localStorage = useLocalStorage();
  const getStoreState = useStoreGetState({ mainApi: mainApiReducer });

  return new TrainAPI(api, localStorage, getStoreState);
}
