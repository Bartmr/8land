import React from 'react';
import { CreateBlockRequestSchema, DynamicBlockType } from '../../../../../api/routes/blocks/blocks-api';
import { GetLandDTO } from '../../../../../api/routes/lands/lands-api';
import { Fragment, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  FaExclamationCircle,
  FaWifi,
} from 'react-icons/fa';
import { useBlocksAPI } from '../../../../../api/routes/blocks/blocks-api';
import { CommunicationError } from '../../../../../communication-errors/communication-errors';

export function AddBlockSection(props: {
  land: GetLandDTO;
  onBlockCreated: () => void;
}) {
  const api = useBlocksAPI();

  const form = useForm({
    resolver: zodResolver(CreateBlockRequestSchema),
    defaultValues: {
      landId: props.land.id,
      data: {
        type: DynamicBlockType.Door,
      },
    },
  });

  const getFieldErrorMessages = (error: any): string[] =>
    error
      ? Object.values(error.types || { default: error.message })
          .filter(Boolean)
          .map((message) => String(message))
      : [];



  const [formSubmission, replaceFormSubmission] = useState<{
    loading?: boolean;
    error?: CommunicationError;
    data?:
      | undefined
      | 'block-limit-exceeded'
      | 'destination-land-not-found'
      | 'land-is-outside-world';
  }>({});

  const type = form.watch('data.type') as DynamicBlockType | undefined;

  return (
    <>
      <div className=" ">
        {formSubmission.loading && formSubmission.data === undefined ? (
          <div className="d-flex flex-column justify-content-center align-items-center">
            <div
              className="d-block spinner-lg spinner-border text-primary"
              role="status"
            >
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : null}
        {formSubmission.loading && formSubmission.data !== undefined ? (
          <div
            style={{
              zIndex: 1,
              right: 'var(--spacer-3)',
              position: 'fixed',
            }}
          >
            <div
              className="d-block spinner-lg spinner-border text-primary"
              role="status"
            >
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : null}
        {formSubmission.error === CommunicationError.ConnectionFailure ? (
          <div className="d-flex flex-column justify-content-center align-items-center">
            <FaWifi className="text-danger" style={{ fontSize: '2rem' }} />
            <p className="mt-3 text-center text-danger mb-0">
              No Internet. Check your connection and try again.
            </p>
          </div>
        ) : formSubmission.error === CommunicationError.AbortedAndDealtWith ? (
          <div className="d-flex flex-column justify-content-center align-items-center">
            <p className="mt-3 text-center mb-0">Redirecting...</p>
          </div>
        ) : formSubmission.error === CommunicationError.UnexpectedResponse ? (
          <div className="d-flex flex-column justify-content-center align-items-center">
            <FaExclamationCircle
              className="text-danger"
              style={{ fontSize: '2rem' }}
            />
            <p className="text-danger mt-3 text-center mb-0">
              An unexpected error occurred. Try again later.
            </p>
          </div>
        ) : null}
        {!formSubmission.loading && !formSubmission.error ? (
          <form
            onSubmit={form.handleSubmit(async (formData) => {
              replaceFormSubmission({ loading: true });

              const res = await api.createBlock(formData);

              if (res.error) {
                replaceFormSubmission({ error: res.error });
              } else {
                if (res.response.status === 403) {
                  if (res.response.body?.error === 'land-is-outside-world') {
                    replaceFormSubmission({
                      data: 'land-is-outside-world',
                    });
                  }
                } else if (res.response.status === 404) {
                  if (
                    res.response.body?.error === 'destination-land-not-found'
                  ) {
                    replaceFormSubmission({
                      data: 'destination-land-not-found',
                    });
                  } else {
                    replaceFormSubmission({
                      error: CommunicationError.UnexpectedResponse,
                    });
                  }
                } else if (res.response.status === 409) {
                  if (res.response.body?.error === 'block-limit-exceeded') {
                    replaceFormSubmission({
                      data: 'block-limit-exceeded',
                    });
                  }
                } else {
                  replaceFormSubmission({});

                  props.onBlockCreated();
                }
              }
            })}
          >
            <div className="mb-3">
              <label htmlFor="block-type-input" className="form-label">
                Block Type
              </label>
              <select
                id="block-type-input"
                {...form.register('data.type')}
                className="form-select"
              >
                <option value={DynamicBlockType.Door}>Door</option>
                <option value={DynamicBlockType.App}>App</option>
              </select>
            </div>
            {type === DynamicBlockType.Door ? (
              <div className="mb-3">
                <label htmlFor="destination-name-input" className="form-label">
                  Destination Land Name
                </label>
                <input
                  {...form.register('data.destinationLandName')}
                  className={`form-control ${
                    formSubmission.data === 'destination-land-not-found' ||
                    form.formState.errors.data?.destinationLandName
                      ? 'is-invalid'
                      : ''
                  }`}
                  id="destination-name-input"
                />

                <div className="invalid-feedback">
                  {formSubmission.data === 'destination-land-not-found'
                    ? "We couldn't find a land with this name. Make sure it's correctly spelled"
                    : null}
                  {formSubmission.data === 'land-is-outside-world'
                    ? 'You can only create doors for lands that belong to you'
                    : null}
                  {
                    form.formState.errors.data?.destinationLandName?.message
                  }
                </div>
              </div>
            ) : null}

            {/*  */}

            {type === DynamicBlockType.App ? (
              <div className="mb-3">
                <label htmlFor="app-url-input" className="form-label">
                  App URL
                </label>
                <input
                  {...form.register('data.url')}
                  className={`form-control ${
                    form.formState.errors.data?.url ? 'is-invalid' : ''
                  }`}
                  id="app-url-input"
                />

                <div className="invalid-feedback">
                  {form.formState.errors.data?.url?.message}
                </div>
              </div>
            ) : null}

            {/*  */}

            {formSubmission.data === 'block-limit-exceeded' ? (
              <div className="text-danger">
                {
                  'You cannot add more blocks to this land. Please delete some blocks before adding a new one.'
                }
              </div>
            ) : null}
            <button
              disabled={form.formState.isSubmitting}
              type="submit"
              className="btn btn-primary"
            >
              Submit
            </button>
          </form>
        ) : null}
      </div>
    </>
  );
}
