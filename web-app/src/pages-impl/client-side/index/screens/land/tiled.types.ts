import { createTiledJSONSchema } from '@shared/src/land/upload-assets/upload-land-assets.schemas';
import z from 'zod';

export type TiledJSON = z.infer<ReturnType<typeof createTiledJSONSchema>>;
