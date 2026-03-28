import 'firebaseui/dist/firebaseui.css';

import * as firebaseui from 'firebaseui';

import { FirebaseAuth } from '../users/auth/firebase-auth';

export const FirebaseAuthUI = new firebaseui.auth.AuthUI(FirebaseAuth);
