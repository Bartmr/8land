import { EditLandBodyDTO } from '@shared/src/land/edit/edit-land.dto';
import { CreateLandRequestSchemaObj } from '@shared/src/land/create/create-land.schemas';
import { GetLandDTO } from '@shared/src/land/get/get-land.dto';
import { z } from 'zod';
import { Fragment, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TransportedDataGate } from 'src/ui/transported-data-gate';
import { useFormUtils } from 'src/forms/form-utils';
import {
  TransportedData,
  TransportedDataStatus,
} from 'src/communicated-data/communicated-data-types';
import { SoundcloudSongApiUrlSchema } from '@shared/src/land/edit/edit-land.schema';
import { useLandsAPI } from 'src/main-api/routes/lands/lands-api';
import { throwError } from '@shared/src/throw-error';

export function MainSection(props: {
  land: GetLandDTO;
  onSuccessfulSave: () => void;
}) {
  const api = useLandsAPI();

  const form = useForm<EditLandBodyDTO>({
    resolver: zodResolver(
      z.object({
        ...CreateLandRequestSchemaObj,
        backgroundMusicUrl: z.union([
          SoundcloudSongApiUrlSchema,
          z.string()
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
                const isIdANumber = z.coerce
                  .number()
                  .safeParse(splittedApiUrl.pop());
                const hostPart = splittedApiUrl.join('/');

                if (
                  isIdANumber.success &&
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
            .refine((s) => s !== 'failed', 'Invalid Soundcloud iframe input'),
        z.null()

        ]),
      }),
    ),
    defaultValues: {
      name: props.land.name || '',
      backgroundMusicUrl: props.land.backgroundMusicUrl || '',
    },
  });
  const formUtils = useFormUtils(form);

  const [formSubmission, replaceFormSubmission] = useState<
    TransportedData<undefined | 'name-already-taken'>
  >({ status: TransportedDataStatus.Done, data: undefined });

  const backgroundMusicUrl = form.watch('backgroundMusicUrl');

  return (
    <div className="card">
      <div className="card-body">
        <TransportedDataGate dataWrapper={formSubmission}>
          {({ data }) => {
            return (
              <form
                onSubmit={form.handleSubmit(async (formData) => {
                  replaceFormSubmission({
                    status: TransportedDataStatus.Loading,
                  });

                  const res = await api.updateLand({
                    landId: props.land.id,
                    formData,
                  });

                  if (res.failure) {
                    replaceFormSubmission({ status: res.failure });
                  } else {
                    if (res.response.status === 409) {
                      if (res.response.body?.error === 'name-already-taken') {
                        replaceFormSubmission({
                          status: TransportedDataStatus.Done,
                          data: res.response.body.error,
                        });
                      } else {
                        replaceFormSubmission({
                          status: res.logAndReturnAsUnexpected().failure,
                        });
                      }
                    } else {
                      replaceFormSubmission({
                        status: TransportedDataStatus.Done,
                        data: undefined,
                      });

                      props.onSuccessfulSave();
                    }
                  }
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
                      formUtils.hasErrors('backgroundMusicUrl')
                        ? 'is-invalid'
                        : ''
                    }`}
                    id="soundcloud-iframe-input"
                  />

                  <div className="invalid-feedback">
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

                {backgroundMusicUrl &&
                !formUtils.hasErrors('backgroundMusicUrl') ? (
                  backgroundMusicUrl.startsWith('https://') ? (
                    <div className="mb-3">
                      <iframe
                        title="soundcloud-player"
                        id="soundcloud-player"
                        width="100%"
                        height="166"
                        frameBorder="no"
                        scrolling="no"
                        allow="autoplay"
                        src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(
                          backgroundMusicUrl,
                        )}`}
                      ></iframe>
                    </div>
                  ) : (
                    <div
                      dangerouslySetInnerHTML={{ __html: backgroundMusicUrl }}
                      className="mb-3"
                    ></div>
                  )
                ) : null}

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
