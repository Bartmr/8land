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
import { LinkAnchor } from 'src/components/ui-kit/protons/link-anchor/link-anchor';
import { TERMS_OF_USE_ROUTE } from '../../terms-of-use/terms-of-use-routes';
import { PRIVACY_POLICY_ROUTE } from '../../privacy-policy/privacy-policy-routes';

function Content() {
  const mainApiSession = useMainApiSession();
  const [hasStarted, replaceHasStarted] = useState(false);

  const [needsEmailVerification, replaceNeedsEmailVerification] =
    useState(false);

  const [loginState, replaceLoginState] = useState<TransportedData<undefined>>({
    status: TransportedDataStatus.NotInitialized,
  });

  const [resendconfirmationEmailState, replaceResendConfirmationEmailState] =
    useState<TransportedData<undefined | 'done'>>({
      status: TransportedDataStatus.Done,
      data: undefined,
    });

  const resendConfirmationEmail = async () => {
    replaceResendConfirmationEmailState({
      status: TransportedDataStatus.Loading,
    });
    await auth.sendEmailVerification(FirebaseAuth.currentUser || throwError());
    replaceResendConfirmationEmailState({
      status: TransportedDataStatus.Done,
      data: 'done',
    });
  };

  useEffect(() => {
    if (!hasStarted) {
      FirebaseAuthUI.start('#firebase-ui', {
        signInOptions: [
          {
            provider: auth.EmailAuthProvider.PROVIDER_ID,
            requireDisplayName: false,
          },
        ],
        callbacks: {
          signInSuccessWithAuthResult: function (_authResult: {
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
              }
              if (res.error === 'needs-verification') {
                if (res.createdNewUser) {
                  await auth.sendEmailVerification(
                    FirebaseAuth.currentUser || throwError(),
                  );
                }

                replaceNeedsEmailVerification(true);
                replaceLoginState({
                  status: TransportedDataStatus.Done,
                  data: undefined,
                });
              } else {
                replaceLoginState({
                  status: res.error,
                });
              }
            })();

            return false;
          },
        },
      });

      replaceHasStarted(true);
    }
  }, []);
  return (
    <>
      <div id="firebase-ui"></div>

      {needsEmailVerification ? (
        <div className="text-center">
          <p>
            We&apos;ve sent you a confirmation email for you to verify your new
            account. <br /> After you verified your account, reload this page
            and login again.
          </p>
          <p>
            {"Don't forget to check your "}
            <span style={{ textDecoration: 'underline' }}>spam folder.</span>
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
      <p className="mt-4 text-center">
        By signing in or confirming your email address, you are agreeing with
        8Land&apos;s{' '}
        <LinkAnchor href={TERMS_OF_USE_ROUTE.getHref()}>
          Terms of Use
        </LinkAnchor>{' '}
        and{' '}
        <LinkAnchor href={PRIVACY_POLICY_ROUTE.getHref()}>
          Privacy Policy
        </LinkAnchor>
      </p>

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
