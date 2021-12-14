import { initializeApp } from '@firebase/app';
import { EnvironmentVariables } from '../../runtime/environment-variables';
import { RUNNING_IN_CLIENT } from '../../runtime/running-in';

if (!RUNNING_IN_CLIENT) {
  throw new Error();
}

const app = initializeApp({
  apiKey: EnvironmentVariables.FIREBASE_API_KEY,
  authDomain: EnvironmentVariables.FIREBASE_AUTH_DOMAIN,
  projectId: EnvironmentVariables.FIREBASE_PROJECT_ID,
  storageBucket: EnvironmentVariables.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: EnvironmentVariables.FIREBASE_MESSAGING_SENDER_ID,
  appId: EnvironmentVariables.FIREBASE_APP_ID,
});

export const FirebaseApp = app;
