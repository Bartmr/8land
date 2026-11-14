import React from 'react';
import { RouteComponentProps, useLocation } from '@reach/router';
import { Layout } from '../../layout/layout';
import { useState, useContext } from 'react';
import { CommunicationError } from '../../../communication-errors/communication-errors';
import {
  FaExclamationCircle,
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
import { CLIENT_SIDE_INDEX_ROUTE } from '../index/index-routes';
import { LOGIN_ROUTE } from '../login/login-routes';
import isEmail from 'validator/lib/isEmail';

const signupResponseSchema = z.union([
  z.object({
    status: z.literal(201),
    body: z.object({
      session: AuthenticationSessionSchema,
    }),
  }),
  z.object({
    status: z.literal(409),
    body: z.unknown(),
  }),
]);

function Content() {
  const api = useApiFetchJSON();
  const { setSessionState } = useContext(AuthenticationStateContext)!;
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formState, setFormState] = useState<{
    loading?: boolean;
    error?: CommunicationError;
    data?: undefined | 'email-already-in-use';
  }>({});

  const isFormValid = email && isEmail(email) && password.length >= 6;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid) {
      return;
    }

    setFormState({ loading: true });

    const res = await api.fetchJSON({
      schema: signupResponseSchema,
      path: '/users/auth/signup',
      method: 'POST',
      body: { email, password },
    });

    if (res.error) {
      setFormState({ error: res.error });
      return;
    }

    if (res.response.status === 409) {
      setFormState({
        data: 'email-already-in-use' as const,
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
              <h2 className="card-title h4 mb-4">Create Account</h2>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    className={`form-control ${
                      email && !isEmail(email) ? 'is-invalid' : ''
                    }`}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                  />
                  <div className="invalid-feedback">
                    Please enter a valid email address
                  </div>
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
                    placeholder="At least 6 characters"
                    required
                    minLength={6}
                  />
                  <div className="invalid-feedback">
                    Password must be at least 6 characters
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={formState.loading || !isFormValid}
                >
                  {formState.loading ? (
                    <span
                      className="spinner-border spinner-border-sm"
                      role="status"
                      aria-hidden="true"
                    ></span>
                  ) : (
                    'Create Account'
                  )}
                </button>

                <div className=" ">
                  {formState.loading ? (
                    <div className="d-flex flex-column justify-content-center align-items-center">
                      <div
                        className="d-block spinner-lg spinner-border text-primary"
                        role="status"
                      >
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : null}
                  {formState.error === CommunicationError.ConnectionFailure ? (
                    <div className="d-flex flex-column justify-content-center align-items-center">
                      <FaWifi
                        className="text-danger"
                        style={{ fontSize: '2rem' }}
                      />
                      <p className="mt-3 text-center text-danger mb-0">
                        No Internet. Check your connection and try again.
                      </p>
                    </div>
                  ) : formState.error === CommunicationError.AbortedAndDealtWith ? (
                    <div className="d-flex flex-column justify-content-center align-items-center">
                      <p className="mt-3 text-center mb-0">Redirecting...</p>
                    </div>
                  ) : formState.error === CommunicationError.UnexpectedResponse ? (
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
                  {formState.data === 'email-already-in-use' ? (
                    <div className="alert alert-warning mt-3 mb-0">
                      An account with this email already exists.{' '}
                      <LinkAnchor
                        href={LOGIN_ROUTE.getHref({
                          next: new URLSearchParams(location.search).get('next'),
                        })}
                      >
                        Sign In
                      </LinkAnchor>
                    </div>
                  ) : null}
                </div>
              </form>

              <p className="mt-3 mb-0 text-center">
                Already have an account?{' '}
                <LinkAnchor href={LOGIN_ROUTE.getHref({ next: new URLSearchParams(location.search).get('next') })}>
                  Sign In
                </LinkAnchor>
              </p>
            </div>
          </div>

          <p className="mt-4 text-center">
            By creating an account, you are agreeing with
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

export function Signup(_props: RouteComponentProps) {
  return (
    <Layout>{() => <Content />}</Layout>
  );
}
