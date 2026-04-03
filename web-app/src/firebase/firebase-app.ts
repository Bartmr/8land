import { initializeApp } from '@firebase/app';
import { EnvironmentVariables } from '../environment-variables';
import { RUNNING_IN_CLIENT } from '../runtime';

if (!RUNNING_IN_CLIENT) {
  throw new Error();
}

const app = initializeApp({
  ...EnvironmentVariables.FIREBASE_CONFIG,
});

export const FirebaseApp = app;
