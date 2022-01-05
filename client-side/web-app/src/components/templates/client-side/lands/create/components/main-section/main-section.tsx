import { EditLandBodyDTO } from '@app/shared/land/edit/edit-land.dto';
import { CreateLandRequestSchemaObj } from '@app/shared/land/create/create-land.schemas';
import { GetLandDTO } from '@app/shared/land/get/get-land.dto';
import { object } from 'not-me/lib/schemas/object/object-schema';
import { Fragment, useState } from 'react';
import { useForm } from 'react-hook-form';
import { TransportedDataGate } from 'src/components/shared/transported-data-gate/transported-data-gate';
import { useFormUtils } from 'src/logic/app-internals/forms/form-utils';
import { notMeReactHookFormResolver } from 'src/logic/app-internals/forms/not-me-react-hook-form-resolver';
import {
  TransportedData,
  TransportedDataStatus,
} from 'src/logic/app-internals/transports/transported-data/transported-data-types';
import { string } from 'not-me/lib/schemas/string/string-schema';
import { number } from 'not-me/lib/schemas/number/number-schema';
import { throwError } from '@app/shared/internals/utils/throw-error';
import { or } from 'not-me/lib/schemas/or/or-schema';
import { SoundcloudSongApiUrlSchema } from '@app/shared/land/edit/edit-land.schema';

export function MainSection(props: {
  land: GetLandDTO;
  onSuccessfulSave: () => void;
}) {
  const form = useForm<EditLandBodyDTO>({
    resolver: notMeReactHookFormResolver(
      object({
        ...CreateLandRequestSchemaObj,
        backgroundMusicUrl: or([
          SoundcloudSongApiUrlSchema,
          string()
            .transform((s) => (s?.trim() ? s : null))
            .transform((s) => {
              if (s != null) {
                let iframeSrc: string;

                try {
                  const temp = document.createElement('div');
                  temp.innerHTML = s;
                  const htmlObject = temp.firstChild || throwError();

                  if (!(htmlObject instanceof HTMLElement)) {
                    throw new Error();
                  }

                  const iSrc = htmlObject.getAttribute('src');

                  if (!iSrc) {
                    return 'failed';
                  }

                  iframeSrc = iSrc;
                } catch (err) {
                  return 'failed';
                }

                const queryString = iframeSrc.split('?')[1];

                if (!queryString) {
                  return 'failed';
                }

                const queryParams = new URLSearchParams(queryString);

                const soundcloudApiEncoded = queryParams.get('url');

                if (!soundcloudApiEncoded) {
                  return 'failed';
                }

                const decodedUrl = decodeURIComponent(soundcloudApiEncoded);

                const splittedApiUrl = decodedUrl.split('/');
                const isIdANumber = number()
                  .required()
                  .validate(splittedApiUrl.pop());
                const hostPart = splittedApiUrl.join('/');

                if (
                  !isIdANumber.errors &&
                  hostPart === 'https://api.soundcloud.com/tracks'
                ) {
                  return decodedUrl;
                } else {
                  return 'failed';
                }
              } else {
                return s;
              }
            })
            .test((s) =>
              s === 'failed' ? 'Invalid Soundcloud iframe input' : null,
            ),
        ]),
      }).required(),
    ),
    defaultValues: {
      name: props.land.name || '',
      backgroundMusicUrl: props.land.backgroundMusicUrl || '',
    },
  });
  const formUtils = useFormUtils(form);

  const [formSubmission] = useState<
    TransportedData<undefined | 'name-already-taken'>
  >({ status: TransportedDataStatus.Done, data: undefined });

  return (
    <div className="card">
      <div className="card-body">
        <TransportedDataGate dataWrapper={formSubmission}>
          {({ data }) => {
            return (
              <form
                onSubmit={form.handleSubmit(async () => {
                  props.onSuccessfulSave();
                })}
              >
                <div className="mb-3">
                  <label htmlFor="name-input" className="form-label">
                    Land Name
                  </label>
                  <input
                    {...form.register('name')}
                    className={`form-control ${
                      data || formUtils.hasErrors('name') ? 'is-invalid' : ''
                    }`}
                    id="name-input"
                  />

                  <div className="invalid-feedback">
                    {data === 'name-already-taken'
                      ? 'This name is already taken'
                      : null}
                    {Object.keys(formUtils.getErrorTypesFromField('name')).map(
                      (e) => {
                        return (
                          <Fragment key={e}>
                            <br />
                            {e}
                          </Fragment>
                        );
                      },
                    )}
                  </div>
                </div>

                <div className="mb-3">
                  <label
                    htmlFor="soundcloud-iframe-input"
                    className="form-label"
                  >
                    Soundcloud Iframe
                  </label>
                  <textarea
                    {...form.register('backgroundMusicUrl')}
                    className={`form-control ${
                      data || formUtils.hasErrors('backgroundMusicUrl')
                        ? 'is-invalid'
                        : ''
                    }`}
                    id="soundcloud-iframe-input"
                  />

                  <div className="invalid-feedback">
                    {data === 'name-already-taken'
                      ? 'This name is already taken'
                      : null}
                    {Object.keys(
                      formUtils.getErrorTypesFromField('backgroundMusicUrl'),
                    ).map((e) => {
                      return (
                        <Fragment key={e}>
                          {e}
                          <br />
                        </Fragment>
                      );
                    })}
                  </div>
                </div>

                <button
                  disabled={form.formState.isSubmitting}
                  type="submit"
                  className="btn btn-primary"
                >
                  Submit
                </button>
              </form>
            );
          }}
        </TransportedDataGate>
      </div>
    </div>
  );
}
