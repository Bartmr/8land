import { useEffect, useState } from 'react';
import {
  TransportedDataGate,
  TransportedDataGateLayout,
} from 'src/components/shared/transported-data-gate/transported-data-gate';
import {
  TransportedData,
  TransportedDataStatus,
} from 'src/logic/app-internals/transports/transported-data/transported-data-types';
import * as auth from 'firebase/auth';
import { FirebaseAuth, getFirebaseUser } from 'src/logic/auth/firebase-auth';
import { useMainApiSessionLogout } from 'src/logic/app-internals/apis/main/session/use-main-api-session-logout';
import isEmail from 'validator/lib/isEmail';

export function ChangeEmail() {
  const logout = useMainApiSessionLogout();

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
                className="btn btn-default"
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
