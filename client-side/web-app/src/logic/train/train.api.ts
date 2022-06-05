import { ToIndexedType } from '@app/shared/internals/transports/dto-types';
import { uuid } from '@app/shared/internals/validation/schemas/uuid.schema';
import { BoardTrainDTO } from '@app/shared/train/board-train.dto';
import {
  ReturnToTrainStationDTO,
  ReturnToTrainStationQueryDTO,
} from '@app/shared/train/return-to-train-station.dto';
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
      uuid(),
      `train-destination:${args.currentStationLandId}`,
    );
  }

  setTrainDestination(args: {
    destinationWorldId: string;
    currentStationLandId: string;
  }) {
    return this.localStorage.setItem(
      `train-destination:${args.currentStationLandId}`,
      args.destinationWorldId,
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
}

export function useTrainAPI() {
  const api = useMainJSONApi();
  const localStorage = useLocalStorage();
  const getStoreState = useStoreGetState({ mainApi: mainApiReducer });

  return new TrainAPI(api, localStorage, getStoreState);
}
