import React from 'react';
import { CreateBlockRequestSchema, DynamicBlockType } from '../../../../../main-api/routes/blocks/blocks-api';
import { GetLandDTO } from '../../../../../main-api/routes/lands/lands-api';
import { Fragment, useState } from 'react';
import { useForm } from 'react-hook-form';
import { CommunicatedDataGate } from '../../../../../ui/communicated-data-gate';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  CommunicatedData,
  CommunicatedDataStatus,
} from '../../../../../communicated-data/communicated-data-types';
import { useBlocksAPI } from '../../../../../main-api/routes/blocks/blocks-api';
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



  const [formSubmission, replaceFormSubmission] = useState<
    CommunicatedData<
      | undefined
      | 'block-limit-exceeded'
      | 'destination-land-not-found'
      | 'land-is-outside-world'
    >
  >({ status: CommunicatedDataStatus.Done, data: undefined });

  const type = form.watch('data.type') as DynamicBlockType | undefined;

  return (
    <>
      <CommunicatedDataGate dataWrapper={formSubmission}>
        {({ data }) => (
          <form
            onSubmit={form.handleSubmit(async (formData) => {
              replaceFormSubmission({ status: CommunicatedDataStatus.Loading });

              const res = await api.createBlock(formData);

              if (res.error) {
                replaceFormSubmission({ status: res.error });
              } else {
                if (res.response.status === 403) {
                  if (res.response.body?.error === 'land-is-outside-world') {
                    replaceFormSubmission({
                      status: CommunicatedDataStatus.Done,
                      data: 'land-is-outside-world',
                    });
                  }
                } else if (res.response.status === 404) {
                  if (
                    res.response.body?.error === 'destination-land-not-found'
                  ) {
                    replaceFormSubmission({
                      status: CommunicatedDataStatus.Done,
                      data: 'destination-land-not-found',
                    });
                  } else {
                    replaceFormSubmission({
                      status: CommunicationError.UnexpectedResponse,
                    });
                  }
                } else if (res.response.status === 409) {
                  if (res.response.body?.error === 'block-limit-exceeded') {
                    replaceFormSubmission({
                      status: CommunicatedDataStatus.Done,
                      data: 'block-limit-exceeded',
                    });
                  }
                } else {
                  replaceFormSubmission({
                    status: CommunicatedDataStatus.Done,
                    data: undefined,
                  });

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
                    data === 'destination-land-not-found' ||
                    form.formState.errors.data?.destinationLandName
                      ? 'is-invalid'
                      : ''
                  }`}
                  id="destination-name-input"
                />

                <div className="invalid-feedback">
                  {data === 'destination-land-not-found'
                    ? "We couldn't find a land with this name. Make sure it's correctly spelled"
                    : null}
                  {data === 'land-is-outside-world'
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

            {data === 'block-limit-exceeded' ? (
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
        )}
      </CommunicatedDataGate>
    </>
  );
}
