import { z } from 'zod';
import { Fragment, useEffect, useState } from 'react';
import { EnvironmentVariables } from 'src/environment-variables';
import {
  TransportedData,
  TransportedDataStatus,
} from 'src/transported-data/transported-data-types';
import { TransportFailure } from 'src/transported-data/transport-failures';
import { useTerritoriesAPI } from 'src/main-api/routes/territories/territories-api';

export function TerritoryAuthenticitySection(props: {
  buttonLabel: string;
  onResult: (
    result:
      | {
          status: 'not-found';
        }
      | {
          status: 'owned' | 'not-owned';
          id: string;
        },
  ) => void;
}) {
  const api = useTerritoriesAPI();

  const [url, replaceUrl] = useState('');

  const [result, replaceResult] = useState<TransportedData<undefined>>({
    status: TransportedDataStatus.NotInitialized,
  });

  const [validation, replaceValidation] = useState<
    { success: true; data: string } | { success: false; error: z.ZodError } | undefined
  >();

  useEffect(() => {
    const prefix = `${EnvironmentVariables.RARIBLE_URL}/token/`;

    if (url) {
      const res = z.string()
        .refine((s) => s.trim().length > 0, 'Must be filled')
        .refine((s) => s.startsWith(prefix), 'Input is not a Rarible link')
        .transform((s) => s.split(prefix)[1] ?? '')
        .refine((s) => s.length > 0, 'Cannot find item parameter in Rarible link')
        .transform((s) => {
          const splitted = s.split('/');
          const withoutFurtherParameters = splitted[0];
          const splittedWithoutQueryParams = withoutFurtherParameters
            ? withoutFurtherParameters.split('?')
            : [];
          return splittedWithoutQueryParams[0] ?? '';
        })
        .refine((s) => s.length > 0, 'Invalid URL ending')
        .transform((s) => ({
          tokenContract: s.split(':')[0] ?? '',
          tokenId: s.split(':')[1] ?? '',
        }))
        .refine((o) => o.tokenContract.length > 0, 'Token contract address is missing from item ID')
        .refine((o) => o.tokenId.length > 0, 'Token ID is missing from item ID')
        .transform((o) => `${o.tokenContract}:${o.tokenId}`)
        .safeParse(url);

      replaceValidation(res);
    }
  }, [url]);

  return (
    <form
      className="mt-4"
      onSubmit={(e) => {
        e.preventDefault();

        (async () => {
          replaceResult({ status: TransportedDataStatus.Loading });

          if (!validation?.success) {
            throw new Error();
          }

          const res = await api.getTerritoryByRaribleItemId({
            raribleItemId: validation.data,
          });

          if (res.failure) {
            if (res.failure === TransportFailure.NotFound) {
              props.onResult({ status: 'not-found' });
            }
            replaceResult({ status: res.failure });
          } else {
            replaceResult({ status: TransportedDataStatus.NotInitialized });

            if (res.response.body.owned) {
              props.onResult({ status: 'owned', id: res.response.body.id });
            } else {
              props.onResult({ status: 'not-owned', id: res.response.body.id });
            }
          }
        })();
      }}
    >
      <div>
        <input
          className={`form-control ${validation?.success === false ? 'is-invalid' : ''}`}
          value={url}
          onChange={(e) => replaceUrl(e.target.value)}
          placeholder={'Rarible item URL'}
        />
        <div className="invalid-feedback">
          {validation?.success === false
            ? validation.error.issues.map((c) => {
                return (
                  <Fragment key={c.message}>
                    {c.message} <br />
                  </Fragment>
                );
              })
            : null}
        </div>
      </div>
      <div className="d-flex align-items-center">
        <button
          type="submit"
          className="mt-2 btn btn-primary me-3"
          disabled={
            result.status === TransportedDataStatus.Loading ||
            !validation?.success
          }
        >
          {props.buttonLabel}
        </button>
      </div>
    </form>
  );
}
