import { z } from 'zod';
import { ReturnToTrainStationQueryDTO } from './return-to-train-station.dto';

export const ReturnToTrainStationQuerySchema: z.ZodType<ReturnToTrainStationQueryDTO> =
  z.object({
    boardedOnTrainStation: z.string(),
  });
