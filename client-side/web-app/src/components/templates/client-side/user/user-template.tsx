import { RouteComponentProps } from '@reach/router';
import { equals } from 'not-me/lib/schemas/equals/equals-schema';
import { object } from 'not-me/lib/schemas/object/object-schema';
import { useState } from 'react';
import { Layout } from 'src/components/routing/layout/layout';
import {
  TransportedData,
  TransportedDataStatus,
} from 'src/logic/app-internals/transports/transported-data/transported-data-types';
import { USER_ROUTE } from './user-routes';

export function UserTemplateContent() {
  const [
    metamaskAddressSubmissionState,
    replaceMetamaskAddressSubmissionState,
  ] = useState<
    TransportedData<undefined | 'done' | 'not-detected' | 'already-requested'>
  >({
    status: TransportedDataStatus.Done,
    data: undefined,
  });
  // const [publicAddress, replacePublicAddress] = useState('');

  const askMetamaskForAddress = async () => {
    if (typeof window.ethereum === 'undefined' || !window.ethereum.isMetaMask) {
      replaceMetamaskAddressSubmissionState({
        status: TransportedDataStatus.Done,
        data: 'not-detected',
      });
      return;
    } else {
      replaceMetamaskAddressSubmissionState({
        status: TransportedDataStatus.Loading,
      });

      try {
        // const res =
        await window.ethereum.request({
          method: 'eth_requestAccounts',
        });
        // const address = res[0];
      } catch (err) {
        const errorValidation = object({
          code: equals([-32002] as const).required(),
        })
          .required()
          .validate(err);

        if (errorValidation.errors) {
          throw err;
        } else {
          replaceMetamaskAddressSubmissionState({
            status: TransportedDataStatus.Done,
            data: 'already-requested',
          });
        }

        return;
      }

      replaceMetamaskAddressSubmissionState({
        status: TransportedDataStatus.Done,
        data: 'done',
      });
    }
  };

  return (
    <>
      <div className="card">
        <div className="card-body">
          <h3>Ethereum / Polygon Wallet</h3>
          <p>
            Connect your wallet&apos;s public address so 8Land can detect your
            territory NTFs
          </p>
          <div className="">
            <button
              disabled={
                metamaskAddressSubmissionState.status ===
                TransportedDataStatus.Loading
              }
              onClick={askMetamaskForAddress}
              className="btn btn-primary"
            >
              {metamaskAddressSubmissionState.status ===
              TransportedDataStatus.Loading ? (
                <>
                  <span
                    className="spinner-grow spinner-grow-sm"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  <span className="visually-hidden">Loading...</span>
                </>
              ) : null}{' '}
              Connect with Metamask
            </button>
            {metamaskAddressSubmissionState.data === 'already-requested' ? (
              <p className="mb-0 mt-2 text-danger">
                A connection request to Metamask was already sent. Open your
                Metamask Chrome Extension and check for any pending permission
                requests.{' '}
                <span className="text-underline">
                  After accepting the permission request, press the
                  &apos;Connect with Metamask&apos; button again
                </span>
              </p>
            ) : null}
            {metamaskAddressSubmissionState.data === 'not-detected' ? (
              <p className="mb-0 mt-2 text-danger">
                Could not detect Metamask. Install and setup Metamask, or insert
                the wallet&apos;s public address manually below.
              </p>
            ) : null}
            {metamaskAddressSubmissionState.data === 'done' ? (
              <p className="mb-0 mt-2 text-success">Connected :D</p>
            ) : null}
          </div>
          <div className="mt-4">
            <p>
              Don&apos;t use Metamask? Insert your wallet&apos;s public address
              manually in the input below
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export function UserTemplate(_props: RouteComponentProps) {
  return (
    <Layout title={USER_ROUTE.label}>{() => <UserTemplateContent />}</Layout>
  );
}
