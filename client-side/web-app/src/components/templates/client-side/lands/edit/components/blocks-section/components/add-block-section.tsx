import { DynamicBlockType } from '@app/shared/blocks/create/create-block.enums';
import { CreateBlockRequestSchema } from '@app/shared/blocks/create/create-block.schemas';
import { GetLandDTO } from '@app/shared/land/get/get-land.dto';
import { Fragment, useState } from 'react';
import { useForm } from 'react-hook-form';
import { TransportedDataGate } from 'src/components/shared/transported-data-gate/transported-data-gate';
import { useFormUtils } from 'src/logic/app-internals/forms/form-utils';
import { notMeReactHookFormResolver } from 'src/logic/app-internals/forms/not-me-react-hook-form-resolver';
import {
  TransportedData,
  TransportedDataStatus,
} from 'src/logic/app-internals/transports/transported-data/transported-data-types';
import { useBlocksAPI } from 'src/logic/blocks/blocks-api';

export function AddBlockSection(props: {
  land: GetLandDTO;
  onBlockCreated: () => void;
}) {
  const api = useBlocksAPI();

  const form = useForm({
    resolver: notMeReactHookFormResolver(CreateBlockRequestSchema),
    defaultValues: {
      landId: props.land.id,
      data: {
        type: DynamicBlockType.Door,
      },
    },
  });
  const formUtils = useFormUtils(form);

  const [formSubmission, replaceFormSubmission] = useState<
    TransportedData<
      undefined | 'block-limit-exceeded' | 'destination-land-not-found'
    >
  >({ status: TransportedDataStatus.Done, data: undefined });

  const type = form.watch('data.type') as DynamicBlockType | undefined;

  return (
    <>
      <TransportedDataGate dataWrapper={formSubmission}>
        {({ data }) => (
          <form
            onSubmit={form.handleSubmit(async (formData) => {
              replaceFormSubmission({ status: TransportedDataStatus.Loading });

              const res = await api.createBlock(formData);

              if (res.failure) {
                replaceFormSubmission({ status: res.failure });
              } else {
                if (res.response.status === 404) {
                  if (
                    res.response.body?.error === 'destination-land-not-found'
                  ) {
                    replaceFormSubmission({
                      status: TransportedDataStatus.Done,
                      data: 'destination-land-not-found',
                    });
                  } else if (
                    res.response.body?.error === 'block-limit-exceeded'
                  ) {
                    replaceFormSubmission({
                      status: TransportedDataStatus.Done,
                      data: 'block-limit-exceeded',
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
                    formUtils.hasErrors('data.destinationLandName')
                      ? 'is-invalid'
                      : ''
                  }`}
                  id="destination-name-input"
                />

                <div className="invalid-feedback">
                  {data === 'destination-land-not-found'
                    ? "We couldn't find a land with this name. Make sure it's correctly spelled"
                    : null}
                  {Object.keys(
                    formUtils.getErrorTypesFromField(
                      'data.destinationLandName',
                    ),
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
                    formUtils.hasErrors('data.url') ? 'is-invalid' : ''
                  }`}
                  id="app-url-input"
                />

                <div className="invalid-feedback">
                  {Object.keys(
                    formUtils.getErrorTypesFromField('data.url'),
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
            ) : null}

            {/*  */}

            {data === 'block-limit-exceeded' ? (
              <div className="text-danger">
                You cannot add more blocks to this land
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
      </TransportedDataGate>
    </>
  );
}
