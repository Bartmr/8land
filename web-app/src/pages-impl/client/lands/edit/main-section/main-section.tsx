import React from 'react';
import { GetLandDTO, CreateLandRequestSchemaObj } from '../../../../../core/main-api/routes/lands/lands-api';
import { z } from 'zod';

import { Fragment, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CommunicatedDataGate } from '../../../../../core/ui/communicated-data-gate';
import {
  CommunicatedData,
  CommunicatedDataStatus,
} from '../../../../../core/communicated-data/communicated-data-types';
import { useLandsAPI } from '../../../../../core/main-api/routes/lands/lands-api';
import { throwError } from '../../../../../core/throw-error';
import { CommunicationError } from '../../../../../core/communication-errors/communication-errors';



export function MainSection(props: {
  land: GetLandDTO;
  onSuccessfulSave: () => void;
}) {
  const api = useLandsAPI();

  const form = useForm<{
    name: string;
    backgroundMusicUrl?: string | null;
  }>({
    resolver: zodResolver(
      z.object({
        ...CreateLandRequestSchemaObj,
        backgroundMusicUrl: z.union([
          z.string().optional().refine((s) => {
            if (s == null) {
              return true;
            }

            return s.startsWith('https://api.soundcloud.com/tracks');
          }, 'Invalid Soundcloud API song url'),
          z.string()
            .transform((s) => (s.trim()))
            .transform((s) => {
              // 1. Create a temporary DOM element to parse the HTML string
              const parser = new DOMParser();
              const doc = parser.parseFromString(s, 'text/html');
              const iframe = doc.querySelector('iframe');
              
              if (!iframe) return 'failed';
              
              // 2. Extract the 'src' attribute
              const src = iframe.getAttribute('src');

              if(!src) return 'failed'
              
              // 3. Parse the URL query parameters
              const urlObj = new URL(src);

              const apiLink = urlObj.searchParams.get('url');
              
              return apiLink; // Returns the fully decoded URL string
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

  const [formSubmission, replaceFormSubmission] = useState<
    CommunicatedData<undefined | 'name-already-taken'>
  >({ status: CommunicatedDataStatus.Done, data: undefined });

  const backgroundMusicUrl = form.watch('backgroundMusicUrl');

  return (
    <div className="card">
      <div className="card-body">
        <CommunicatedDataGate dataWrapper={formSubmission}>
          {({ data }) => {
            return (
              <form
                onSubmit={form.handleSubmit(async (formData) => {
                  replaceFormSubmission({
                    status: CommunicatedDataStatus.Loading,
                  });

                  const res = await api.updateLand({
                    landId: props.land.id,
                    formData,
                  });

                  if (res.error) {
                    replaceFormSubmission({ status: res.error });
                  } else {
                    if (res.response.status === 409) {
                      if (res.response.body?.error === 'name-already-taken') {
                        replaceFormSubmission({
                          status: CommunicatedDataStatus.Done,
                          data: res.response.body.error,
                        });
                      } else {
                        replaceFormSubmission({
                          status: CommunicationError.UnexpectedResponse,
                        });
                      }
                    } else {
                      replaceFormSubmission({
                        status: CommunicatedDataStatus.Done,
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
                      data || form.formState.errors.name ? 'is-invalid' : ''
                    }`}
                    id="name-input"
                  />

                  <div className="invalid-feedback">
                    {data === 'name-already-taken'
                      ? 'This name is already taken'
                      : null}
                    {form.formState.errors.name?.message}
                  </div>
                </div>

                <div className="mb-3">
                  <label
                    htmlFor="soundcloud-iframe-input"
                    className="form-label"
                  >
                    Soundcloud Iframe
                    <p className="text-small" style={{fontSize: '0.8rem'}}>{"(Go to the song, then Share > Embed, and copy the code to here)"}</p>
                  </label>
                  <textarea
                    {...form.register('backgroundMusicUrl')}
                    className={`form-control ${
                      form.formState.errors.backgroundMusicUrl
                        ? 'is-invalid'
                        : ''
                    }`}
                    id="soundcloud-iframe-input"
                  />

                  <div className="invalid-feedback">
                    {form.formState.errors.backgroundMusicUrl?.message}
                  </div>
                </div>

                {backgroundMusicUrl &&
                !form.formState.errors.backgroundMusicUrl ? (
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
        </CommunicatedDataGate>
      </div>
    </div>
  );
}
