import { ToIndexedType } from '@app/shared/internals/transports/dto-types';
import { throwError } from '@app/shared/internals/utils/throw-error';
import { RouteComponentProps } from '@reach/router';
import { equals } from 'not-me/lib/schemas/equals/equals-schema';
import { object } from 'not-me/lib/schemas/object/object-schema';
import { useEffect, useState } from 'react';
import { Layout } from 'src/components/routing/layout/layout';
import {
  TransportedDataGate,
  TransportedDataGateLayout,
} from 'src/components/shared/transported-data-gate/transported-data-gate';
import { mainApiReducer } from 'src/logic/app-internals/apis/main/main-api-reducer';
import { MainApiSessionData } from 'src/logic/app-internals/apis/main/session/main-api-session-types';
import { useMainApiSession } from 'src/logic/app-internals/apis/main/session/use-main-api-session';
import { useMainJSONApi } from 'src/logic/app-internals/apis/main/use-main-json-api';
import { useStoreSelector } from 'src/logic/app-internals/store/use-store-selector';
import {
  TransportedData,
  TransportedDataStatus,
} from 'src/logic/app-internals/transports/transported-data/transported-data-types';
import { USER_ROUTE } from './user-routes';
import { GetUserWalletNonce } from '@app/shared/users/me/get-user-wallet-nonce.dto';
import { ReceiveSignedUserNonceRequestDTO } from '@app/shared/users/me/receive-signed-user-nonce.dto';
import { Logger } from 'src/logic/app-internals/logging/logger';
import { useMainApiSessionLogout } from 'src/logic/app-internals/apis/main/session/use-main-api-session-logout';
import { ChangeEmail } from './components/change-email';

export function WalletSectionWithNonce(props: {
  session: null | MainApiSessionData;
  refreshSession: () => Promise<MainApiSessionData | null | undefined>;
  nonce: string;
  walletAddress: null | string;
}) {
  const mainApi = useMainJSONApi();

  const [nonceSignState, replaceNonceSignState] = useState<
    TransportedData<
      undefined | 'done' | 'not-detected' | 'already-requested' | 'denied'
    >
  >({
    status: TransportedDataStatus.Done,
    data: undefined,
  });

  const signNonce = async () => {
    if (typeof window.ethereum === 'undefined' || !window.ethereum.isMetaMask) {
      replaceNonceSignState({
        status: TransportedDataStatus.Done,
        data: 'not-detected',
      });
      return;
    } else {
      replaceNonceSignState({
        status: TransportedDataStatus.Loading,
      });

      let address: string;

      try {
        const res = await window.ethereum.request({
          method: 'eth_requestAccounts',
        });
        const _address = res[0];

        if (!_address) {
          replaceNonceSignState({
            status: TransportedDataStatus.Done,
            data: 'not-detected',
          });

          return;
        }

        address = _address;
      } catch (err) {
        const errorValidation = object({
          code: equals([-32002] as const).required(),
        })
          .required()
          .validate(err);

        if (errorValidation.errors) {
          throw err;
        } else {
          replaceNonceSignState({
            status: TransportedDataStatus.Done,
            data: 'already-requested',
          });
        }

        return;
      }

      let signedNonce: string;

      try {
        signedNonce = await window.ethereum.request({
          method: 'personal_sign',
          params: [address, props.nonce],
        });
      } catch (err) {
        const errorValidation = object({
          code: equals([4001] as const).required(),
        })
          .required()
          .validate(err);

        if (errorValidation.errors) {
          throw err;
        } else {
          replaceNonceSignState({
            status: TransportedDataStatus.Done,
            data: 'denied',
          });
        }

        return;
      }

      const res = await mainApi.patch<
        { status: 204; body: undefined },
        undefined,
        ToIndexedType<ReceiveSignedUserNonceRequestDTO>
      >({
        path: '/users/me/walletNonce',
        query: undefined,
        body: {
          signedNonce,
        },
        acceptableStatusCodes: [204],
      });

      if (res.failure) {
        replaceNonceSignState({
          status: res.failure,
        });
      } else {
        replaceNonceSignState({
          status: TransportedDataStatus.Done,
          data: 'done',
        });

        const sessionRes = await props.refreshSession();

        if (!sessionRes) {
          return;
        }

        if (sessionRes.walletAddress !== address) {
          Logger.logError('wallet-mismatch-after-verification', new Error(), {
            addressObtainedFromWebApp: address,
            addressAfterVerification: sessionRes.walletAddress,
            userId: sessionRes.userId,
          });
        }
      }
    }
  };

  return (
    <div className="card">
      <div className="card-body">
        <h2 className="card-title h3">Ethereum / Polygon Wallet</h2>
        {props.walletAddress ? (
          <>
            <p className="text-success">
              Connected to wallet {props.walletAddress}
            </p>
            <p>
              {
                'Click "Connect with Metamask" to change the wallet used with 8Land'
              }
            </p>
          </>
        ) : (
          <p>
            {
              "Connect your wallet's public address so 8Land can detect your territory NTFs"
            }
          </p>
        )}
        <div className="">
          <button
            disabled={nonceSignState.status === TransportedDataStatus.Loading}
            onClick={signNonce}
            className="btn btn-primary"
          >
            {nonceSignState.status === TransportedDataStatus.Loading ? (
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

          <div className="d-flex">
            <TransportedDataGate
              className="mt-2"
              layout={TransportedDataGateLayout.Tape}
              dataWrapper={nonceSignState}
            >
              {({ data }) => (
                <>
                  {data === 'already-requested' ? (
                    <p className="mb-0 text-danger">
                      A connection request to Metamask was already sent. Open
                      your Metamask Chrome Extension and check for any pending
                      requests from 8Land.{' '}
                      <span className="text-underline">
                        After accepting the permission request, press the
                        &apos;Connect with Metamask&apos; button again
                      </span>
                    </p>
                  ) : null}
                  {data === 'not-detected' ? (
                    <p className="mb-0 text-danger">
                      Could not detect Metamask. Install and setup Metamask.
                    </p>
                  ) : null}
                  {data === 'denied' ? (
                    <p className="mb-0 text-danger">
                      Permission to sign the nonce was rejected. Try again and
                      accept the request to sign the nonce, in order to verify
                      that you own this wallet.
                    </p>
                  ) : null}
                  {data === 'done' ? (
                    <p className="mb-0 text-success">Connected :D</p>
                  ) : null}
                </>
              )}
            </TransportedDataGate>
          </div>
        </div>
      </div>
    </div>
  );
}

export function WalletSection(props: {
  session: null | MainApiSessionData;
  refreshSession: () => Promise<MainApiSessionData | null | undefined>;
}) {
  const mainApi = useMainJSONApi();
  const [nonce, replaceNonce] = useState<TransportedData<string>>({
    status: TransportedDataStatus.NotInitialized,
  });
  const session = useStoreSelector(
    { mainApi: mainApiReducer },
    (s) => s.mainApi.session,
  );

  useEffect(() => {
    (async () => {
      const res = await mainApi.get<
        { status: 200; body: ToIndexedType<GetUserWalletNonce> },
        undefined
      >({
        path: '/users/me/walletNonce',
        query: undefined,
        acceptableStatusCodes: [200],
      });

      if (res.failure) {
        replaceNonce({ status: res.failure });
      } else {
        replaceNonce({
          status: TransportedDataStatus.Done,
          data: res.response.body.walletNonce,
        });
      }
    })();
  }, []);

  return (
    <TransportedDataGate dataWrapper={session}>
      {({ data: sessionData }) => (
        <TransportedDataGate dataWrapper={nonce}>
          {({ data: nonceData }) => (
            <WalletSectionWithNonce
              {...props}
              nonce={nonceData}
              walletAddress={(sessionData || throwError()).walletAddress}
            />
          )}
        </TransportedDataGate>
      )}
    </TransportedDataGate>
  );
}

export function UserTemplate(_props: RouteComponentProps) {
  const mainApiSession = useMainApiSession();
  const session = useStoreSelector(
    { mainApi: mainApiReducer },
    (s) => s.mainApi.session,
  );
  const logout = useMainApiSessionLogout();

  return (
    <Layout title={USER_ROUTE.label}>
      {() => (
        <TransportedDataGate
          dataWrapper={
            session.status === TransportedDataStatus.Refreshing
              ? { status: TransportedDataStatus.Loading }
              : session
          }
        >
          {({ data: sessionData }) => (
            <>
              <div className="card mb-3">
                <div className="card-body d-flex justify-content-end">
                  <button
                    onClick={() => logout.logout()}
                    className="btn btn-default"
                  >
                    Log out
                  </button>
                </div>
              </div>
              <WalletSection
                session={sessionData}
                refreshSession={() => mainApiSession.refreshSession()}
              />
              <div className="mt-3">
                <ChangeEmail />
              </div>
            </>
          )}
        </TransportedDataGate>
      )}
    </Layout>
  );
}
