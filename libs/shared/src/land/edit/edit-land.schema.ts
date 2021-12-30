import { object } from 'not-me/lib/schemas/object/object-schema';
import { Schema } from 'not-me/lib/schemas/schema';
import { string } from 'not-me/lib/schemas/string/string-schema';
import { uuid } from '../../internals/validation/schemas/uuid.schema';
import { CreateLandRequestSchemaObj } from '../create/create-land.schemas';
import { EditLandBodyDTO, EditLandParametersDTO } from './edit-land.dto';
import { number } from 'not-me/lib/schemas/number/number-schema';

export const EditLandParametersSchema: Schema<EditLandParametersDTO> = object({
  landId: uuid().required(),
}).required();

export const EditLandBodySchema: Schema<EditLandBodyDTO> = object({
  ...CreateLandRequestSchemaObj,
  backgroundMusicUrl: string()
    .notNull()
    .test((s) => {
      if (s) {
        const splittedApiUrl = s.split('/');
        const isIdANumber = number().required().validate(splittedApiUrl.pop());
        const hostPart = splittedApiUrl.join('/');

        if (
          !isIdANumber.errors &&
          hostPart === 'https://api.soundcloud.com/tracks/'
        ) {
          return null;
        } else {
          return 'Invalid Soundcloud API song url';
        }
      } else {
        return null;
      }
    }),
}).required();

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
