import {
  GetTrainDestinationsDTO,
  BoardTrainDTO,
  ReturnToTrainStationDTO,
} from './train.dtos';
import { useMainApiFetchJSON } from '../../fetch-json';
import { useLocalStorage } from '../../../local-storage';
import { z } from 'zod';
import {
  AuthenticationSession,
  useOptionalAuthenticationStateSessionData,
} from '../../../users/authentication/authentication-state';

type MainApiFetchJSON = ReturnType<typeof useMainApiFetchJSON>;

const trainDestinationStorageSchema = z.object({
  name: z.string(),
  worldId: z.uuid(),
});

const landAssetsResponseBodySchema = z.object({
  baseUrl: z.string(),
  mapKey: z.string(),
  tilesetKey: z.string(),
});

const landAssetsResponseBodyPropertySchema = z
  .union([landAssetsResponseBodySchema, z.undefined()])
  .transform((assets) => assets);

const landDoorBlockEntryResponseBodySchema = z.object({
  id: z.string(),
  toLand: z.object({
    id: z.string(),
    name: z.string(),
  }),
});

const landAppBlockEntryResponseBodySchema = z.object({
  id: z.string(),
  url: z.string(),
});

const navigateToLandResponseBodySchema = z.object({
  id: z.string(),
  name: z.string(),
  backgroundMusicUrl: z.string().nullable(),
  doorBlocks: z.array(landDoorBlockEntryResponseBodySchema),
  doorBlocksReferencing: z.array(
    z.object({
      id: z.string(),
      fromLandId: z.string(),
      fromLandName: z.string(),
    }),
  ),
  appBlocks: z.array(landAppBlockEntryResponseBodySchema),
  assets: landAssetsResponseBodyPropertySchema,
  isStartLand: z.boolean(),
});

const boardTrainResponseSchema: z.ZodType<{
  status: 200;
  body: BoardTrainDTO;
}> = z.object({
  status: z.literal(200),
  body: navigateToLandResponseBodySchema,
});

const returnToTrainStationResponseSchema: z.ZodType<{
  status: 200;
  body: ReturnToTrainStationDTO;
}> = z.object({
  status: z.literal(200),
  body: navigateToLandResponseBodySchema,
});

const getTrainDestinationsResponseSchema: z.ZodType<{
  status: 200;
  body: GetTrainDestinationsDTO;
}> = z.object({
  status: z.literal(200),
  body: z.object({
    limit: z.number(),
    total: z.number(),
    rows: z.array(
      z.object({
        name: z.string(),
        worldId: z.string(),
      }),
    ),
  }),
});

export class TrainAPI {
  constructor(
    private api: MainApiFetchJSON,
    private localStorage: ReturnType<typeof useLocalStorage>,
    private session: null | AuthenticationSession,
  ) {}

  getTrainDestination(args: { currentStationLandId: string }) {
    return this.localStorage.getItem(
      trainDestinationStorageSchema.optional(),
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

    return this.api.fetchJSON({
      schema: boardTrainResponseSchema,
      path: `/train/board/${args.worldId}`,
      method: 'GET',
    });
  }

  returnToTrainStation() {
    const query = new URLSearchParams();

    if (!this.session) {
      const returningTrainStationId = this.localStorage.getItem(
        z.uuid().optional(),
        'last-train-station',
      );

      if (returningTrainStationId) {
        query.set('boardedOnTrainStation', returningTrainStationId);
      }
    }

    const queryString = query.toString();

    return this.api.fetchJSON({
      schema: returnToTrainStationResponseSchema,
      path: `/train/return${queryString ? `?${queryString}` : ''}`,
      method: 'GET',
    });
  }

  searchDestinations(args: { skip: number; searchQuery: string }) {
    const query = new URLSearchParams({
      skip: String(args.skip),
      name: args.searchQuery,
    });

    return this.api.fetchJSON({
      schema: getTrainDestinationsResponseSchema,
      path: `/train/apps/tickets/getDestinations?${query.toString()}`,
      method: 'GET',
    });
  }
}

export function useTrainAPI() {
  const api = useMainApiFetchJSON();
  const localStorage = useLocalStorage();
  const session = useOptionalAuthenticationStateSessionData();

  return new TrainAPI(api, localStorage, session);
}
