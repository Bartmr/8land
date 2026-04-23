import React from 'react';
import { useEffect, useState } from 'react';
import {
  TransportedDataGate,
  TransportedDataGateLayout,
} from '../../../../ui/transported-data-gate';
import {
  TransportedData,
  TransportedDataStatus,
} from '../../../../communicated-data/communicated-data-types';
import * as auth from 'firebase/auth';
import { FirebaseAuth, getFirebaseUser } from '../../../../firebase/firebase-auth';
import { useUserAuthLogout } from '../../../../users/authentication/use-user-auth-logout';
import isEmail from 'validator/lib/isEmail';

export function ChangeEmail() {
  const logout = useUserAuthLogout();

  const [formStatus, replaceFormStatus] = useState<TransportedData<undefined>>({
    status: TransportedDataStatus.NotInitialized,
  });

  const [email, replaceEmail] = useState('');

  const sendVerificationEmail = async () => {
    replaceFormStatus({ status: TransportedDataStatus.Loading });

    const firebaseUser = await getFirebaseUser();

    if (!firebaseUser) {
      await logout.logout();
      return;
    }

    await auth.verifyBeforeUpdateEmail(firebaseUser, email);

    replaceFormStatus({ status: TransportedDataStatus.Done, data: undefined });
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
        {formStatus.status === TransportedDataStatus.Done ? (
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
                  formStatus.status === TransportedDataStatus.Loading ||
                  !(email && isEmail(email))
                }
                onClick={sendVerificationEmail}
              >
                Send verification email
              </button>
              <TransportedDataGate
                dataWrapper={formStatus}
                layout={TransportedDataGateLayout.Tape}
              >
                {() => null}
              </TransportedDataGate>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
