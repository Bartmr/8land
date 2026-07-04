import { createTiledJSONSchema } from '../../../../main-api/routes/lands/lands-api';
import z from 'zod';

export type TiledJSON = z.infer<ReturnType<typeof createTiledJSONSchema>>;
