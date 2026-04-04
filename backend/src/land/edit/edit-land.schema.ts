import { z } from 'zod';
import { CreateLandRequestSchemaObj } from '../create/create-land.schemas';
import { EditLandBodyDTO, EditLandParametersDTO } from './edit-land.dto';

export const SoundcloudSongApiUrlSchema = z.string().optional().refine((s) => {
  if (!s) {
    return true;
  }

  const parts = s.split('/');
  const isIdANumber = z.coerce.number().safeParse(parts.pop());
  const hostPart = parts.join('/');

  return isIdANumber.success && hostPart === 'https://api.soundcloud.com/tracks';
}, 'Invalid Soundcloud API song url');

export const EditLandParametersSchema: z.ZodType<EditLandParametersDTO> = z.object({
  landId: z.uuid(),
});

export const EditLandBodySchema= z.object({
  ...CreateLandRequestSchemaObj,
  backgroundMusicUrl: SoundcloudSongApiUrlSchema,
});
