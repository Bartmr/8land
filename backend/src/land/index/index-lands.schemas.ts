import { z } from 'zod';
import { IndexLandsQueryDTO } from './index-lands.dto';

export const IndexLandsQuerySchema: z.ZodType<IndexLandsQueryDTO> = z.object({
  skip: z.number().int('Must be an integer'),
});
