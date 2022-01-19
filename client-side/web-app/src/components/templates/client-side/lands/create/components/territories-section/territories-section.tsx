import { GetLandDTO } from '@app/shared/land/get/get-land.dto';
import { number } from 'not-me/lib/schemas/number/number-schema';
import { object } from 'not-me/lib/schemas/object/object-schema';
import { Fragment, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  TransportedDataGate,
  TransportedDataGateLayout,
} from 'src/components/shared/transported-data-gate/transported-data-gate';
import { useFormUtils } from 'src/logic/app-internals/forms/form-utils';
import { notMeReactHookFormResolver } from 'src/logic/app-internals/forms/not-me-react-hook-form-resolver';
import {
  TransportedData,
  TransportedDataStatus,
} from 'src/logic/app-internals/transports/transported-data/transported-data-types';
import { TerritoryPreview } from './territory-preview';

const schema = object({
  data: object({
    startX: number()
      .required()
      .integer()
      .test((n) => (n >= 0 ? null : 'Must be a positive number')),
    startY: number()
      .required()
      .integer()
      .test((n) => (n >= 0 ? null : 'Must be a positive number')),
    endX: number()
      .required()
      .integer()
      .test((n) => (n >= 0 ? null : 'Must be a positive number')),
    endY: number()
      .required()
      .integer()
      .test((n) => (n >= 0 ? null : 'Must be a positive number')),
  })
    .required()
    .test((v) =>
      v.endX > v.startX
        ? null
        : 'End X coordinate must be bigger than Start X coordinate',
    )
    .test((v) =>
      v.endX > v.startX
        ? null
        : 'End Y coordinate must be bigger than Start Y coordinate',
    ),
}).required();

export function TerritoriesSection(props: { land: GetLandDTO }) {
  const [formSubmission] = useState<
    TransportedData<undefined | 'intersects-existing-territory'>
  >({ status: TransportedDataStatus.Done, data: undefined });
  const [territoryThumbnail, replaceTerritoryThumbnail] = useState<
    undefined | Blob
  >();

  const form = useForm({
    resolver: notMeReactHookFormResolver(schema),
    reValidateMode: 'onChange',
  });

  const formUtils = useFormUtils(form);

  const [startX, startY, endX, endY] = form.watch([
    'data.startX',
    'data.startY',
    'data.endX',
    'data.endY',
  ]);

  const pendingIntervalValidation = schema.validate({
    data: {
      startX,
      startY,
      endX,
      endY,
    },
  });

  return props.land.assets ? (
    <div>
      <h3>Territories</h3>
      <div className="row g-3">
        <div className="col-6">
          <form
            onSubmit={form.handleSubmit(async () => {
              const confirmation = window.confirm('Create the territory?');

              if (!confirmation) {
                return;
              }
            })}
          >
            <div className="text-danger mb-3">
              {formSubmission.data === 'intersects-existing-territory' ? (
                <Fragment>
                  <br />
                  This territory coordinates intersect an existing territory
                </Fragment>
              ) : null}
              {Object.keys(formUtils.getErrorTypesFromField('data')).map(
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
            <div className="d-flex">
              <div>
                <label htmlFor="startx-input" className="form-label">
                  Start X
                </label>
                <input
                  {...form.register('data.startX')}
                  className={`form-control ${
                    formUtils.hasErrors('data.startX') ? 'is-invalid' : ''
                  }`}
                  id="startx-input"
                />

                <div className="invalid-feedback">
                  {Object.keys(
                    formUtils.getErrorTypesFromField('data.startX'),
                  ).map((e) => {
                    return (
                      <Fragment key={e}>
                        <br />
                        {e}
                      </Fragment>
                    );
                  })}
                </div>
              </div>

              <div>
                <label htmlFor="starty-input" className="form-label">
                  Start Y
                </label>
                <input
                  {...form.register('data.startY')}
                  className={`form-control ${
                    formUtils.hasErrors('data.startY') ? 'is-invalid' : ''
                  }`}
                  id="starty-input"
                />

                <div className="invalid-feedback">
                  {Object.keys(
                    formUtils.getErrorTypesFromField('data.startY'),
                  ).map((e) => {
                    return (
                      <Fragment key={e}>
                        <br />
                        {e}
                      </Fragment>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-3 d-flex">
              <div>
                <label htmlFor="endx-input" className="form-label">
                  End X
                </label>
                <input
                  {...form.register('data.endX')}
                  className={`form-control ${
                    formUtils.hasErrors('data.endX') ? 'is-invalid' : ''
                  }`}
                  id="endx-input"
                />

                <div className="invalid-feedback">
                  {Object.keys(
                    formUtils.getErrorTypesFromField('data.endX'),
                  ).map((e) => {
                    return (
                      <Fragment key={e}>
                        <br />
                        {e}
                      </Fragment>
                    );
                  })}
                </div>
              </div>

              <div>
                <label htmlFor="endy-input" className="form-label">
                  End Y
                </label>
                <input
                  {...form.register('data.endY')}
                  className={`form-control ${
                    formUtils.hasErrors('data.endY') ? 'is-invalid' : ''
                  }`}
                  id="endy-input"
                />

                <div className="invalid-feedback">
                  {Object.keys(
                    formUtils.getErrorTypesFromField('data.endY'),
                  ).map((e) => {
                    return (
                      <Fragment key={e}>
                        <br />
                        {e}
                      </Fragment>
                    );
                  })}
                </div>
              </div>
            </div>

            {territoryThumbnail ? (
              <div className="w-100 mt-3">
                <img
                  alt="Territory thumbnail"
                  style={{ maxWidth: '100%' }}
                  src={window.URL.createObjectURL(territoryThumbnail)}
                />
              </div>
            ) : null}

            <div className="mt-3 d-flex align-items-center">
              <button
                disabled={
                  formSubmission.status === TransportedDataStatus.Loading ||
                  !territoryThumbnail
                }
                className="btn btn-success"
                type="submit"
              >
                Create
              </button>
              <TransportedDataGate
                className="ms-3"
                layout={TransportedDataGateLayout.Tape}
                dataWrapper={formSubmission}
              >
                {() => null}
              </TransportedDataGate>
            </div>
          </form>
        </div>
        <div className="col-4">
          <div className="mt-3">
            <TerritoryPreview
              land={props.land}
              intervals={[
                {
                  startX: 5,
                  startY: 5,
                  endX: 9,
                  endY: 9,
                },
              ]}
              pendingInterval={
                pendingIntervalValidation.errors
                  ? undefined
                  : pendingIntervalValidation.value.data
              }
            />
          </div>
        </div>
      </div>
      <div className="d-none">
        {pendingIntervalValidation.errors ? null : (
          <TerritoryPreview
            land={props.land}
            intervals={[pendingIntervalValidation.value.data]}
            onScreenshotTaken={replaceTerritoryThumbnail}
          />
        )}
      </div>
    </div>
  ) : null;
}
