import {
  GetTrainDestinationQueryDTO,
  GetTrainDestinationsDTO,
  BoardTrainDTO,
  ReturnToTrainStationDTO,
} from './train.dtos';
import {
  mainApiReducer,
  MainApiStoreState,
} from '../../main-api-reducer';
import {
  MainJSONApi,
  useMainJSONApi,
} from '../../use-main-json-api';
import { useStoreGetState } from '../../../redux/use-store-get-state';
import { useLocalStorage } from '../../../local-storage';
import { object, uuid, string } from 'zod';

export class TrainAPI {
  constructor(
    private api: MainJSONApi,
    private localStorage: ReturnType<typeof useLocalStorage>,
    private getMainApiStoreState: () => { mainApi: MainApiStoreState },
  ) {}

  getTrainDestination(args: { currentStationLandId: string }) {
    return this.localStorage.getItem(
      object({
        name: string(),
        worldId: uuid(),
      }).optional(),
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
      { status: 200; body: BoardTrainDTO },
      undefined
    >({
      path: `/train/board/${args.worldId}`,
      query: undefined,
      acceptableStatusCodes: [200],
    });
  }

  returnToTrainStation() {
    const query = new URLSearchParams();

    const session = this.getMainApiStoreState().mainApi.session.data;

    if (!session) {
      const returningTrainStationId = this.localStorage.getItem(
        uuid().optional(),
        'last-train-station',
      );

      if (returningTrainStationId) {
        query.set('boardedOnTrainStation', returningTrainStationId);
      }
    }

    return this.api.get<
      { status: 200; body: ReturnToTrainStationDTO },
      URLSearchParams
    >({
      path: `/train/return`,
      query,
      acceptableStatusCodes: [200],
    });
  }

  searchDestinations(args: { skip: number; searchQuery: string }) {
    const query = new URLSearchParams({
      skip: String(args.skip),
      name: args.searchQuery,
    });

    return this.api.get<
      { status: 200; body: GetTrainDestinationsDTO },
      URLSearchParams
    >({
      path: `/train/apps/tickets/getDestinations`,
      query,
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
