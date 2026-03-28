import { createTiledJSONSchema } from '@shared/land/upload-assets/upload-land-assets.schemas';
import { InferType } from 'not-me/lib/schemas/schema';

export type TiledJSON = InferType<ReturnType<typeof createTiledJSONSchema>>;
