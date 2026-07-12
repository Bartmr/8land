import { createTiledJSONSchema } from '../../../../../core/api/routes/lands/lands-api';
import z from 'zod';

export type TiledJSON = z.infer<ReturnType<typeof createTiledJSONSchema>>;
