import { Module } from '@nestjs/common';
import * as firebaseAdmin from 'firebase-admin';
import { EnvironmentVariablesService } from 'src/internals/environment/environment-variables.service';
import { generateRandomUUID } from 'src/internals/utils/generate-random-uuid';
import { throwError } from 'src/internals/utils/throw-error';
import { FIREBASE_EMULATOR_PROJECT_ID } from './firebase.constants';
import { FirebaseService } from './firebase.service';

type FirebaseApp = ReturnType<typeof firebaseAdmin['initializeApp']>;

@Module({
  providers: [
    {
      provide: FirebaseService,
      useFactory: () => {
        let app: FirebaseApp;

        if (EnvironmentVariablesService.variables.FIREBASE_AUTH_EMULATOR_HOST) {
          app = firebaseAdmin.initializeApp(
            {
              projectId: FIREBASE_EMULATOR_PROJECT_ID || throwError(),
            },
            generateRandomUUID(),
          );
        } else {
          throw new Error('Not implemented');
        }

        return new FirebaseService(app);
      },
    },
  ],
  exports: [FirebaseService],
})
export class FirebaseModule {}
