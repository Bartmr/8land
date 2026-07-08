import React from 'react';
import { RouteComponentProps, useLocation } from '@reach/router';
import { Layout } from '../../layout/layout';
import { useState, useContext } from 'react';
import {
  CommunicatedData,
  CommunicatedDataStatus,
} from '../../../core/communicated-data/communicated-data-types';
import { CommunicatedDataGate } from '../../../core/ui/communicated-data-gate';
import { LinkAnchor } from '../../../core/ui/link-anchor';
import { TERMS_OF_USE_ROUTE } from '../../terms-of-use/terms-of-use-routes';
import { PRIVACY_POLICY_ROUTE } from '../../privacy-policy/privacy-policy-routes';
import { useMainApiFetchJSON } from '../../../core/main-api/fetch-json';
import { z } from 'zod';
import { AuthenticationSessionSchema } from '../../../core/users/authentication/authentication-schemas';
import { AuthenticationStateContext } from '../../../core/users/authentication/authentication-state';
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
  const mainApi = useMainApiFetchJSON();
  const { setSessionState } = useContext(AuthenticationStateContext)!;
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formState, setFormState] = useState<
    CommunicatedData<undefined | 'email-already-in-use'>
  >({
    status: CommunicatedDataStatus.NotInitialized,
  });

  const isFormValid = email && isEmail(email) && password.length >= 6;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid) {
      return;
    }

    setFormState({ status: CommunicatedDataStatus.Loading });

    const res = await mainApi.fetchJSON({
      schema: signupResponseSchema,
      path: '/users/auth/signup',
      method: 'POST',
      body: { email, password },
    });

    if (res.error) {
      setFormState({ status: res.error });
      return;
    }

    if (res.response.status === 409) {
      setFormState({
        status: CommunicatedDataStatus.Done,
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
                  disabled={
                    formState.status === CommunicatedDataStatus.Loading ||
                    !isFormValid
                  }
                >
                  {formState.status === CommunicatedDataStatus.Loading ? (
                    <span
                      className="spinner-border spinner-border-sm"
                      role="status"
                      aria-hidden="true"
                    ></span>
                  ) : (
                    'Create Account'
                  )}
                </button>

                <CommunicatedDataGate dataWrapper={formState}>
                  {(wrapper) => {
                    if (wrapper.data === 'email-already-in-use') {
                      return (
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
                      );
                    }

                    return null;
                  }}
                </CommunicatedDataGate>
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

export function SignupTemplate(_props: RouteComponentProps) {
  return (
    <Layout>{() => <Content />}</Layout>
  );
}
