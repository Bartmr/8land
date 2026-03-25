import { object } from 'not-me/lib/schemas/object/object-schema';
import { Schema } from 'not-me/lib/schemas/schema';
import { string } from 'not-me/lib/schemas/string/string-schema';
import { ReturnToTrainStationQueryDTO } from './return-to-train-station.dto';

export const ReturnToTrainStationQuerySchema: Schema<ReturnToTrainStationQueryDTO> =
  object({
    boardedOnTrainStation: string().required(),
  }).required();
