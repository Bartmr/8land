import { createTiledJSONSchema } from '../../../../../main-api/routes/lands/upload-assets/upload-land-assets.schemas';
import z from 'zod';

export type TiledJSON = z.infer<ReturnType<typeof createTiledJSONSchema>>;
