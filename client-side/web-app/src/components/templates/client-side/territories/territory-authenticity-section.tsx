import { throwError } from '@app/shared/internals/utils/throw-error';
import { ValidationResult } from 'not-me/lib/schemas/schema';
import { string } from 'not-me/lib/schemas/string/string-schema';
import { Fragment, useEffect, useState } from 'react';
import { EnvironmentVariables } from 'src/logic/app-internals/runtime/environment-variables';
import {
  TransportedData,
  TransportedDataStatus,
} from 'src/logic/app-internals/transports/transported-data/transported-data-types';
import { TransportFailure } from 'src/logic/app-internals/transports/transported-data/transport-failures';
import { useTerritoriesAPI } from 'src/logic/territories/territories-api';

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
    ValidationResult<string> | undefined
  >();

  useEffect(() => {
    const prefix = `${EnvironmentVariables.RARIBLE_URL}/token/`;

    if (url) {
      const res = string()
        .filled()
        .test((s) => {
          return s.startsWith(prefix) ? null : 'Input is not a Rarible link';
        })
        .transform((s) => {
          const splitted = s.split(prefix);

          return splitted[1];
        })
        .test((s) => {
          return s ? null : 'Cannot find item parameter in Rarible link';
        })
        .transform((s) => {
          const splitted = (s as string).split('/');

          const withoutFurtherParameters = splitted[0];

          const splittedWithoutQueryParams = withoutFurtherParameters
            ? withoutFurtherParameters.split('?')
            : [];

          return splittedWithoutQueryParams[0];
        })
        .test((s) => {
          return s ? null : 'Invalid URL ending';
        })
        .transform((s) => {
          const splitted = (s as string).split(':');

          return {
            tokenContract: splitted[0],
            tokenId: splitted[1],
          };
        })
        .test((o) => {
          return o.tokenContract
            ? null
            : 'Token contract address is missing from item ID';
        })
        .test((o) => {
          return o.tokenId ? null : 'Token ID is missing from item ID';
        })
        .transform((o) => {
          return `${o.tokenContract || throwError()}:${
            o.tokenId || throwError()
          }`;
        })
        .validate(url, { abortEarly: true });

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

          if (!(validation && !validation.errors)) {
            throw new Error();
          }

          const res = await api.getTerritoryByRaribleItemId({
            raribleItemId: validation.value,
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
          className={`form-control ${validation?.errors ? 'is-invalid' : ''}`}
          value={url}
          onChange={(e) => replaceUrl(e.target.value)}
          placeholder={'Rarible item URL'}
        />
        <div className="invalid-feedback">
          {validation?.errors
            ? (validation.messagesTree as string[]).map((c) => {
                return (
                  <Fragment key={c}>
                    {c} <br />
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
            !(validation && !validation.errors)
          }
        >
          {props.buttonLabel}
        </button>
      </div>
    </form>
  );
}
