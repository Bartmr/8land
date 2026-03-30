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

export const EditLandBodySchema: z.ZodType<EditLandBodyDTO> = z.object({
  ...CreateLandRequestSchemaObj,
  backgroundMusicUrl: SoundcloudSongApiUrlSchema,
});

// .notNull()
//     .transform((s) => {
//       if(s != null) {
//         let iframeSrc: string;

//         try {
//           const $  = cheerio.load(s);

//           const iSrc = $('iframe').attr('src')

//           if(!iSrc) {
//             return 'failed'
//           }

//           iframeSrc = iSrc
//         } catch(err) {
//           return 'failed'
//         }

//         const queryString = iframeSrc.split('?')[1];

//         if(!queryString) {
//           return 'failed'
//         }

//         const queryParams = new URLSearchParams(queryString)

//         const soundcloudApiEncoded = queryParams.get('url')

//         if(!soundcloudApiEncoded) {
//           return 'failed'
//         }

//         const decodedUrl = decodeURIComponent(soundcloudApiEncoded)

//         const splittedApiUrl = decodedUrl.split('/')
//         const isIdANumber = number().required().validate(splittedApiUrl.pop())
//         const hostPart = splittedApiUrl.join('/')

//         if(
//           !isIdANumber.errors
//           && hostPart === 'https://api.soundcloud.com/tracks/'
//         ) {
//           return decodedUrl
//         } else {
//           return 'failed'
//         }
//       } else {
//         return s
//       }
//     })
//     .test((s) => s === 'failed' ? 'Invalid Soundcloud iframe input' : null)
