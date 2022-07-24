import { getAuth, connectAuthEmulator, User } from 'firebase/auth';
import { EnvironmentVariables } from 'src/logic/app-internals/runtime/environment-variables';
import { FirebaseApp } from '../app-internals/apis/firebase/firebase-app';

const auth = getAuth(FirebaseApp);

if (EnvironmentVariables.FIREBASE_AUTH_EMULATOR_URL) {
  connectAuthEmulator(auth, EnvironmentVariables.FIREBASE_AUTH_EMULATOR_URL, {
    disableWarnings: true,
  });
}

export const FirebaseAuth = auth;

let firebaseUser: User | null = null;

const firstFirebaseUserLoadPromise = new Promise((resolve) => {
  FirebaseAuth.onAuthStateChanged((user) => {
    firebaseUser = user;
    resolve(undefined);
  });
});

export const getFirebaseUser = async () => {
  await firstFirebaseUserLoadPromise;
  return firebaseUser;
};
