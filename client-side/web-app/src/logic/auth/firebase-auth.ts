import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { EnvironmentVariables } from 'src/logic/app-internals/runtime/environment-variables';
import { FirebaseApp } from '../app-internals/apis/firebase/firebase-app';

const auth = getAuth(FirebaseApp);

if (EnvironmentVariables.FIREBASE_AUTH_EMULATOR_URL) {
  connectAuthEmulator(auth, EnvironmentVariables.FIREBASE_AUTH_EMULATOR_URL, {
    disableWarnings: true,
  });
}

export const FirebaseAuth = auth;
