import { ToIndexedType } from '@app/shared/internals/transports/dto-types';
import { JSONData } from '@app/shared/internals/transports/json-types';
import { CreateBlockRequestDTO } from '@app/shared/land/blocks/create/create-block.dto';
import { BlockType } from '@app/shared/land/blocks/create/create-block.enums';
import { CreateBlockRequestSchema } from '@app/shared/land/blocks/create/create-block.schemas';
import { GetLandDTO } from '@app/shared/land/get/get-land.dto';
import { Fragment, useState } from 'react';
import { useForm } from 'react-hook-form';
import { TransportedDataGate } from 'src/components/shared/transported-data-gate/transported-data-gate';
import { useMainJSONApi } from 'src/logic/app-internals/apis/main/use-main-json-api';
import { useFormUtils } from 'src/logic/app-internals/forms/form-utils';
import { notMeReactHookFormResolver } from 'src/logic/app-internals/forms/not-me-react-hook-form-resolver';
import {
  TransportedData,
  TransportedDataStatus,
} from 'src/logic/app-internals/transports/transported-data/transported-data-types';

export function AddBlockSection(props: {
  land: GetLandDTO;
  onBlockCreated: () => void;
}) {
  const api = useMainJSONApi();

  const form = useForm({
    resolver: notMeReactHookFormResolver(CreateBlockRequestSchema),
    defaultValues: {
      data: {
        type: BlockType.Door,
        landId: props.land.id,
      },
    },
  });
  const formUtils = useFormUtils(form);

  const [formSubmission, replaceFormSubmission] = useState<
    TransportedData<
      undefined | 'block-limit-exceeded' | 'destination-land-not-found'
    >
  >({ status: TransportedDataStatus.Done, data: undefined });

  return (
    <>
      <TransportedDataGate dataWrapper={formSubmission}>
        {({ data }) => (
          <form
            onSubmit={form.handleSubmit(async (formData) => {
              replaceFormSubmission({ status: TransportedDataStatus.Loading });

              const res = await api.post<
                | { status: 201; body: JSONData }
                | { status: 404 | 409; body: undefined | { error: string } },
                undefined,
                ToIndexedType<CreateBlockRequestDTO>
              >({
                path: '/lands/blocks',
                query: undefined,
                acceptableStatusCodes: [201, 404, 409],
                body: formData,
              });

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
                disabled
                {...form.register('data.type')}
                className="form-select"
              >
                <option value={BlockType.Door}>Door</option>
              </select>
            </div>
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
                  formUtils.getErrorTypesFromField('data.destinationLandName'),
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
