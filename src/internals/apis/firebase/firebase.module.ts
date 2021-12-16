import { Module } from '@nestjs/common';
import * as firebaseAdmin from 'firebase-admin';
import { EnvironmentVariablesService } from 'src/internals/environment/environment-variables.service';
import { throwError } from 'src/internals/utils/throw-error';
import { FirebaseService } from './firebase.service';

type FirebaseApp = ReturnType<typeof firebaseAdmin['initializeApp']>;

type ModuleHotData = {
  app: FirebaseApp;
};

@Module({
  providers: [
    {
      provide: FirebaseService,
      useFactory: () => {
        let app: FirebaseApp;

        const moduleHotData = module.hot?.data as ModuleHotData | undefined;

        if (moduleHotData) {
          app = moduleHotData.app;
        } else if (
          EnvironmentVariablesService.variables.FIREBASE_AUTH_EMULATOR_HOST
        ) {
          app = firebaseAdmin.initializeApp({
            projectId:
              EnvironmentVariablesService.variables.FIREBASE_PROJECT_ID ||
              throwError(),
          });
        } else {
          throw new Error('Not implemented');
        }

        module.hot?.dispose((data: ModuleHotData) => {
          data.app = app;
        });

        return new FirebaseService(app);
      },
    },
  ],
  exports: [FirebaseService],
})
export class FirebaseModule {}
