import { RouteComponentProps } from '@reach/router';
import { Layout } from 'src/components/routing/layout/layout';
import { LOGIN_ROUTE } from './login-routes';
import { useEffect, useState } from 'react';
import * as auth from 'firebase/auth';
import { FirebaseAuthUI } from 'src/logic/auth/firebase-auth-ui';
import {
  TransportedData,
  TransportedDataStatus,
} from 'src/logic/app-internals/transports/transported-data/transported-data-types';
import { FirebaseAuth } from 'src/logic/auth/firebase-auth';
import { throwError } from '@app/shared/internals/utils/throw-error';
import { TransportedDataGate } from 'src/components/shared/transported-data-gate/transported-data-gate';
import { useMainApiSession } from 'src/logic/app-internals/apis/main/session/use-main-api-session';

function Content() {
  const mainApiSession = useMainApiSession();

  const [resendconfirmationEmailState, replaceResendConfirmationEmailState] =
    useState<TransportedData<undefined | 'done'>>({
      status: TransportedDataStatus.Done,
      data: undefined,
    });

  const [needsEmailVerification, replaceNeedsEmailVerification] =
    useState(false);

  const [loginState, replaceLoginState] = useState<TransportedData<undefined>>({
    status: TransportedDataStatus.NotInitialized,
  });

  const resendConfirmationEmail = async () => {
    replaceResendConfirmationEmailState({
      status: TransportedDataStatus.Loading,
    });
    await auth.sendEmailVerification(FirebaseAuth.currentUser || throwError());
    replaceResendConfirmationEmailState({
      status: TransportedDataStatus.Done,
      data: undefined,
    });
  };

  useEffect(() => {
    FirebaseAuthUI.start('#firebase-ui', {
      signInOptions: [
        {
          provider: auth.EmailAuthProvider.PROVIDER_ID,
          requireDisplayName: false,
        },
      ],
      callbacks: {
        signInSuccessWithAuthResult: function (authResult: {
          user: {
            uid: string;
            email: string;
            emailVerified: boolean;
            isAnonymous: boolean;
            providerData: [];
            stsTokenManager: {
              refreshToken: string;
              accessToken: string;
              expirationTime: number;
            };
            apiKey: string;
            appName: string;
          };
          credential: null;
          operationType: string;
          additionalUserInfo: {
            isNewUser: boolean;
            providerId: string;
            profile: {};
          };
        }) {
          if (authResult.user.emailVerified) {
            replaceLoginState({
              status: TransportedDataStatus.Loading,
            });

            (async () => {
              const res = await mainApiSession.login({
                firebaseIdToken: await (
                  FirebaseAuth.currentUser || throwError()
                ).getIdToken(),
              });

              if (res === 'ok') {
                return;
              } else {
                replaceLoginState({
                  status: res,
                });
              }
            })();
          } else {
            replaceNeedsEmailVerification(true);
          }

          return false;
        },
      },
    });
  }, []);
  return (
    <>
      <div id="firebase-ui"></div>
      {needsEmailVerification ? (
        <div className="text-center">
          <p>
            We sent you a confirmation email for you to verify your new account.{' '}
            <br /> After you verified your account, reload this page and login
            again.
          </p>
          <TransportedDataGate dataWrapper={resendconfirmationEmailState}>
            {({ data }) =>
              data ? (
                <span className="text-success">
                  Confirmation email was sent
                </span>
              ) : (
                <button
                  disabled={
                    resendconfirmationEmailState.status ===
                    TransportedDataStatus.Loading
                  }
                  onClick={resendConfirmationEmail}
                  className="btn btn-default"
                >
                  {resendconfirmationEmailState.status ===
                  TransportedDataStatus.Loading ? (
                    <span
                      className="spinner-border spinner-border-sm"
                      role="status"
                      aria-hidden="true"
                    ></span>
                  ) : null}{' '}
                  Re-send confirmation email
                </button>
              )
            }
          </TransportedDataGate>
        </div>
      ) : null}
      <TransportedDataGate dataWrapper={loginState}>
        {() => null}
      </TransportedDataGate>
    </>
  );
}

function FirebaseSessionGate() {
  const [isSigningOut, replaceIsSigningOut] = useState(true);

  useEffect(() => {
    (async () => {
      await FirebaseAuth.signOut();

      replaceIsSigningOut(false);
    })();
  }, []);

  return (
    <TransportedDataGate
      dataWrapper={
        isSigningOut
          ? { status: TransportedDataStatus.Loading }
          : { status: TransportedDataStatus.Done, data: undefined }
      }
    >
      {() => <Content />}
    </TransportedDataGate>
  );
}

export function LoginTemplate(_props: RouteComponentProps) {
  return (
    <Layout title={LOGIN_ROUTE.title}>{() => <FirebaseSessionGate />}</Layout>
  );
}
