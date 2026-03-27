import { Module } from '@nestjs/common';
import * as firebaseAdmin from 'firebase-admin';
import { applicationDefault } from 'firebase-admin/app';
import { throwError } from 'src/throw-error';
import { FirebaseService } from './firebase.service';
import { EnvironmentVariables } from 'src/environment/environment-variables';
import { v4 } from 'uuid';

type FirebaseApp = ReturnType<typeof firebaseAdmin['initializeApp']>;

@Module({
  providers: [
    {
      provide: FirebaseService,
      useFactory: () => {
        let app: FirebaseApp;

        if (EnvironmentVariables.FIREBASE_AUTH_EMULATOR_HOST) {
          app = firebaseAdmin.initializeApp(
            {
              projectId: EnvironmentVariables.FIREBASE_EMULATOR_PROJECT_ID || throwError(),
            },
            v4()
          );
        } else {
          app = firebaseAdmin.initializeApp({
            credential: applicationDefault(),
          });
        }

        return new FirebaseService(app);
      },
    },
  ],
  exports: [FirebaseService],
})
export class FirebaseModule {}
