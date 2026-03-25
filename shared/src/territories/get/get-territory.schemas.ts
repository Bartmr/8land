import { z } from 'zod';
import { GetTerritoryParametersDTO } from './get-territory.dto';

export const GetTerritoryParametersSchema: z.ZodType<GetTerritoryParametersDTO> =
  z.object({
    id: z.string(),
  });
