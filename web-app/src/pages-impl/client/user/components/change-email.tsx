import React from 'react';
import { useEffect, useState } from 'react';
import {
  CommunicatedDataGate,
  CommunicatedDataGateLayout,
} from '../../../../ui/communicated-data-gate';
import {
  CommunicatedData,
  CommunicatedDataStatus,
} from '../../../../communicated-data/communicated-data-types';
import * as auth from 'firebase/auth';
import { FirebaseAuth, getFirebaseUser } from '../../../../firebase/firebase-auth';
import { useUserAuthLogout } from '../../../../users/authentication/use-user-auth-logout';
import isEmail from 'validator/lib/isEmail';

export function ChangeEmail() {
  const logout = useUserAuthLogout();

  const [formStatus, replaceFormStatus] = useState<CommunicatedData<undefined>>({
    status: CommunicatedDataStatus.NotInitialized,
  });

  const [email, replaceEmail] = useState('');

  const sendVerificationEmail = async () => {
    replaceFormStatus({ status: CommunicatedDataStatus.Loading });

    const firebaseUser = await getFirebaseUser();

    if (!firebaseUser) {
      await logout.logout();
      return;
    }

    await auth.verifyBeforeUpdateEmail(firebaseUser, email);

    replaceFormStatus({ status: CommunicatedDataStatus.Done, data: undefined });
  };

  useEffect(() => {
    (async () => {
      const firebaseUser = FirebaseAuth.currentUser;

      if (!firebaseUser) {
        await logout.logout();
      }
    })();
  }, []);

  return (
    <div className="card">
      <div className="card-body">
        <h2 className="card-title h3">Change your email</h2>
        {formStatus.status === CommunicatedDataStatus.Done ? (
          <>
            <p className="text-success">
              A confirmation email was sent to your newly set email address
            </p>
          </>
        ) : (
          <>
            <div className="mt-4 mb-3">
              <input
                className={`form-control ${
                  !email || isEmail(email) ? '' : 'is-invalid'
                } `}
                value={email}
                onChange={(e) => replaceEmail(e.target.value)}
              />
              <div className="invalid-feedback">Not a valid email</div>
            </div>
            <div className="d-flex">
              <button
                className="btn btn-secondary"
                disabled={
                  formStatus.status === CommunicatedDataStatus.Loading ||
                  !(email && isEmail(email))
                }
                onClick={sendVerificationEmail}
              >
                Send verification email
              </button>
              <CommunicatedDataGate
                dataWrapper={formStatus}
                layout={CommunicatedDataGateLayout.Tape}
              >
                {() => null}
              </CommunicatedDataGate>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
