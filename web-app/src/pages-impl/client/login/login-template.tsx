import React from 'react';
import { RouteComponentProps } from '@reach/router';
import { Layout } from '../../layout/layout';
import { useEffect, useState } from 'react';
import * as auth from 'firebase/auth';
import { FirebaseAuthUI } from '../../../firebase/firebase-auth-ui';
import {
  CommunicatedData,
  CommunicatedDataStatus,
} from '../../../communicated-data/communicated-data-types';
import { FirebaseAuth } from '../../../firebase/firebase-auth';
import { CommunicatedDataGate } from '../../../ui/communicated-data-gate';
import { LinkAnchor } from '../../../ui/link-anchor';
import { TERMS_OF_USE_ROUTE } from '../../terms-of-use/terms-of-use-routes';
import { PRIVACY_POLICY_ROUTE } from '../../privacy-policy/privacy-policy-routes';
import { throwError } from '../../../throw-error';
import { useMainApiFetchJSON } from '../../../main-api/fetch-json';
import { z } from 'zod';
import { AuthenticationSessionSchema } from '../../../users/authentication/authentication-schemas';
import { useContext } from 'react';
import { AuthenticationStateContext } from '../../../users/authentication/authentication-state';
import { navigate } from 'gatsby';
import { useLocation } from '@reach/router';
import { CLIENT_SIDE_INDEX_ROUTE } from '../index/index-routes';

const loginResponseSchema = z.union([
  z.object({
    status: z.literal(201),
    body: z.object({
      session: AuthenticationSessionSchema,
    }),
  }),
  z.object({
    status: z.literal(409),
    body: z.object({
      error: z.literal('needs-verification'),
      createdNewUser: z.boolean().optional(),
    }),
  }),
]);

function Content() {
  const mainApi = useMainApiFetchJSON();
  const { setSessionState } = useContext(AuthenticationStateContext) || throwError();
  const location = useLocation();
  const [hasStarted, replaceHasStarted] = useState(false);

  const [needsEmailVerification, replaceNeedsEmailVerification] =
    useState(false);

  const [loginState, replaceLoginState] = useState<CommunicatedData<undefined>>({
    status: CommunicatedDataStatus.NotInitialized,
  });

  const [resendconfirmationEmailState, replaceResendConfirmationEmailState] =
    useState<CommunicatedData<undefined | 'done'>>({
      status: CommunicatedDataStatus.Done,
      data: undefined,
    });

  const resendConfirmationEmail = async () => {
    replaceResendConfirmationEmailState({
      status: CommunicatedDataStatus.Loading,
    });
    await auth.sendEmailVerification(FirebaseAuth.currentUser || throwError());
    replaceResendConfirmationEmailState({
      status: CommunicatedDataStatus.Done,
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
              status: CommunicatedDataStatus.Loading,
            });

            (async () => {
              const res = await mainApi.fetchJSON({
                path: '/users/auth',
                method: 'POST',
                body: {
                  firebaseIdToken: await (
                    FirebaseAuth.currentUser || throwError()
                  ).getIdToken(),
                },
                schema: loginResponseSchema,
              });

              if (res.error) {
                replaceLoginState({
                  status: res.error,
                });
                return;
              }

              if (res.response.status === 201) {
                setSessionState({ data: res.response.body.session });
                await navigate(
                  new URLSearchParams(location.search).get('next') ||
                    CLIENT_SIDE_INDEX_ROUTE.getHref(),
                );
                return;
              }

              if (res.response.body.error === 'needs-verification') {
                if (res.response.body.createdNewUser) {
                  await auth.sendEmailVerification(
                    FirebaseAuth.currentUser || throwError(),
                  );
                }

                replaceNeedsEmailVerification(true);
                replaceLoginState({
                  status: CommunicatedDataStatus.Done,
                  data: undefined,
                });
              }
            })();

            return false;
          },
        },
      });

      replaceHasStarted(true);
    }
  }, [hasStarted, location.search, mainApi, setSessionState]);
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
          <CommunicatedDataGate dataWrapper={resendconfirmationEmailState}>
            {({ data }) =>
              data ? (
                <span className="text-success">
                  Confirmation email was sent
                </span>
              ) : (
                <button
                  disabled={
                    resendconfirmationEmailState.status ===
                    CommunicatedDataStatus.Loading
                  }
                  onClick={resendConfirmationEmail}
                  className="btn btn-secondary"
                >
                  {resendconfirmationEmailState.status ===
                  CommunicatedDataStatus.Loading ? (
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
          </CommunicatedDataGate>
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

      <CommunicatedDataGate dataWrapper={loginState}>
        {() => null}
      </CommunicatedDataGate>
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
    <CommunicatedDataGate
      dataWrapper={
        isSigningOut
          ? { status: CommunicatedDataStatus.Loading }
          : { status: CommunicatedDataStatus.Done, data: undefined }
      }
    >
      {() => <Content />}
    </CommunicatedDataGate>
  );
}

export function LoginTemplate(_props: RouteComponentProps) {
  return (
    <Layout>{() => <FirebaseSessionGate />}</Layout>
  );
}
