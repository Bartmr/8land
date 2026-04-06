import { getAuth, connectAuthEmulator, User, Auth } from 'firebase/auth';
import { EnvironmentVariables } from '../environment-variables';
import { FirebaseApp } from './firebase-app';

let auth: Auth

if (EnvironmentVariables.FIREBASE_AUTH_EMULATOR_URL) {
  auth = getAuth();
  connectAuthEmulator(auth, EnvironmentVariables.FIREBASE_AUTH_EMULATOR_URL, {
    disableWarnings: true,
  });
} else {
  auth = getAuth(FirebaseApp)
}

export const FirebaseAuth = auth;

let firebaseUser: User | null = null;

let firebaseUserPromiseIsResolved = false;

const firstFirebaseUserLoadPromise = new Promise((resolve) => {
  FirebaseAuth.onAuthStateChanged((user) => {
    firebaseUser = user;

    if (!firebaseUserPromiseIsResolved) {
      firebaseUserPromiseIsResolved = true;
      resolve(undefined);
    }
  });
});

export const getFirebaseUser = async () => {
  await firstFirebaseUserLoadPromise;
  return firebaseUser;
};
