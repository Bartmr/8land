import React from 'react';
import { RouteComponentProps } from '@reach/router';
import { Layout } from '../../layout/layout';
import { useState, useContext } from 'react';
import {
  CommunicatedData,
  CommunicatedDataStatus,
} from '../../../communicated-data/communicated-data-types';
import { CommunicationError } from '../../../communication-errors/communication-errors';
import {
  FaExclamationCircle,
  FaLock,
  FaSearch,
  FaWifi,
} from 'react-icons/fa';
import { LinkAnchor } from '../../../ui/link-anchor';
import { TERMS_OF_USE_ROUTE } from '../../terms-of-use/terms-of-use-routes';
import { PRIVACY_POLICY_ROUTE } from '../../privacy-policy/privacy-policy-routes';
import { useApiFetchJSON } from '../../../api/fetch-json';
import { z } from 'zod';
import { AuthenticationSessionSchema } from '../../../users/authentication/authentication-schemas';
import { AuthenticationStateContext } from '../../../users/authentication/authentication-state';
import { navigate } from 'gatsby';
import { useLocation } from '@reach/router';
import { CLIENT_SIDE_INDEX_ROUTE } from '../index/index-routes';
import { SIGNUP_ROUTE } from '../signup/signup-routes';
import isEmail from 'validator/lib/isEmail';

const loginResponseSchema = z.union([
  z.object({
    status: z.literal(201),
    body: z.object({
      session: AuthenticationSessionSchema,
    }),
  }),
  z.object({
    status: z.literal(404),
    body: z.unknown(),
  }),
]);

function Content() {
  const api = useApiFetchJSON();
  const { setSessionState } = useContext(AuthenticationStateContext)!;
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formState, setFormState] = useState<
    CommunicatedData<undefined | 'invalid-credentials'>
  >({
    status: CommunicatedDataStatus.NotInitialized,
  });


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setFormState({ status: CommunicatedDataStatus.Loading });

    const res = await api.fetchJSON({
      schema: loginResponseSchema,
      path: '/users/auth/login',
      method: 'POST',
      body: { email, password },
    });

    if (res.error) {
      setFormState({ status: res.error });
      return;
    }

    if (res.response.status === 404) {
      setFormState({
        status: CommunicatedDataStatus.Done,
        data: 'invalid-credentials' as const,
      });
      return;
    }

    setSessionState({ data: res.response.body.session });
    await navigate(
      new URLSearchParams(location.search).get('next') ||
        CLIENT_SIDE_INDEX_ROUTE.getHref(),
    );
  };

  return (
    <>
      <div className="row justify-content-center mt-5">
        <div className="col-12 col-sm-8 col-md-6">
          <div className="card">
            <div className="card-body">
              <h2 className="card-title h4 mb-4">Sign In</h2>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    className={`form-control`}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="password" className="form-label">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    className={`form-control ${
                      password && password.length < 6 ? 'is-invalid' : ''
                    }`}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={
                    formState.status === CommunicatedDataStatus.Loading
                  }
                >
                  {formState.status === CommunicatedDataStatus.Loading ? (
                    <span
                      className="spinner-border spinner-border-sm"
                      role="status"
                      aria-hidden="true"
                    ></span>
                  ) : (
                    'Sign In'
                  )}
                </button>

                <div className=" ">
                  {formState.status === CommunicatedDataStatus.NotInitialized ? null : formState.status === CommunicatedDataStatus.Loading ? (
                    <div className="d-flex flex-column justify-content-center align-items-center">
                      <div
                        className="d-block spinner-lg spinner-border text-primary"
                        role="status"
                      >
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : formState.status === CommunicatedDataStatus.Refreshing ? (
                    <div
                      style={{
                        zIndex: 1,
                        right: 'var(--spacer-3)',
                        position: 'fixed',
                      }}
                    >
                      <div
                        className="d-block spinner-lg spinner-border text-primary"
                        role="status"
                      >
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : formState.status === CommunicationError.NotFound ? (
                    <div className="d-flex flex-column justify-content-center align-items-center">
                      <FaSearch style={{ fontSize: '2rem' }} />
                      <p className="mt-3 text-center mb-0">Not Found</p>
                    </div>
                  ) : formState.status === CommunicationError.ConnectionFailure ? (
                    <div className="d-flex flex-column justify-content-center align-items-center">
                      <FaWifi
                        className="text-danger"
                        style={{ fontSize: '2rem' }}
                      />
                      <p className="mt-3 text-center text-danger mb-0">
                        No Internet. Check your connection and try again.
                      </p>
                    </div>
                  ) : formState.status === CommunicationError.Forbidden ? (
                    <div className="d-flex flex-column justify-content-center align-items-center">
                      <FaLock style={{ fontSize: '2rem' }} />
                      <p className="mt-3 text-center mb-0">
                        You are not allowed to access this content
                      </p>
                    </div>
                  ) : formState.status === CommunicationError.AbortedAndDealtWith ? (
                    <div className="d-flex flex-column justify-content-center align-items-center">
                      <p className="mt-3 text-center mb-0">Redirecting...</p>
                    </div>
                  ) : formState.status === CommunicationError.UnexpectedResponse ? (
                    <div className="d-flex flex-column justify-content-center align-items-center">
                      <FaExclamationCircle
                        className="text-danger"
                        style={{ fontSize: '2rem' }}
                      />
                      <p className="text-danger mt-3 text-center mb-0">
                        An unexpected error occurred. Try again later.
                      </p>
                    </div>
                  ) : null}
                  {formState.status === CommunicatedDataStatus.Done ||
                  formState.status === CommunicatedDataStatus.Refreshing ? (
                    formState.data === 'invalid-credentials' ? (
                      <div className="alert alert-warning mt-3 mb-0">
                        Invalid email or password. Please try again.
                      </div>
                    ) : null
                  ) : null}
                </div>
              </form>

              <p className="mt-3 mb-0 text-center">
                Don&apos;t have an account?{' '}
                <LinkAnchor href={SIGNUP_ROUTE.getHref({ next: new URLSearchParams(location.search).get('next') })}>
                  Sign Up
                </LinkAnchor>
              </p>
            </div>
          </div>

          <p className="mt-4 text-center">
            By signing in, you are agreeing with
            8Land&apos;s{' '}
            <LinkAnchor href={TERMS_OF_USE_ROUTE.getHref()}>
              Terms of Use
            </LinkAnchor>{' '}
            and{' '}
            <LinkAnchor href={PRIVACY_POLICY_ROUTE.getHref()}>
              Privacy Policy
            </LinkAnchor>
          </p>
        </div>
      </div>
    </>
  );
}

export function Login(_props: RouteComponentProps) {
  return (
    <Layout>{() => <Content />}</Layout>
  );
}
