import React from 'react';
import { ResumeLandNavigationDTO } from '../../../core/api/routes/lands/lands-api';
import { useRef, useState } from 'react';
import { UserAuthSessionData } from '../../../core/users/authentication/user-auth-types';
import { MusicService } from './music-ticker';
import { AppScreen, AppService } from './screens/app/app-screen';
import {
  DialogueScreen,
  DialogueService,
} from './screens/dialogue/dialogue-screen';
import { LandScreen } from './screens/land/land-screen';
import { LandScreenService } from './screens/land/land-screen.service';
import { KeypadBroker } from './keypad-broker';

enum CurrentScreen {
  Land = 'land',
  Dialogue = 'dialogue',
  App = 'app',
}

export function ScreenSwitcher(props: {
  keypad: KeypadBroker,
  musicService: MusicService;
  resumedLand: ResumeLandNavigationDTO;
  session: null | UserAuthSessionData;
  changeLandNameDisplay: (landName: string) => void;
}) {
  const landScreenServiceRef = useRef<null | LandScreenService>(null);

  const [dialogueService, replaceDialogueService] = useState<
    DialogueService | undefined
  >();
  const [appService, replaceAppService] = useState<AppService | undefined>();

  const [currentScreen, replaceCurrentScreen] = useState(CurrentScreen.Land);

  return (
    <>
      {dialogueService && appService ? (
        <div
          style={{
            height: currentScreen === CurrentScreen.Land ? undefined : 0,
          }}
        >
          <LandScreen
            {...props}
            onService={(sv) => {
              landScreenServiceRef.current = sv;
            }}
            dialogueService={dialogueService}
            appService={appService}
          />
        </div>
      ) : null}
      <div
        style={{
          display:
            currentScreen === CurrentScreen.Dialogue ? undefined : 'none',
          paddingBottom: '4px',
        }}
      >
        <DialogueScreen
          keypad={props.keypad}
          onService={replaceDialogueService}
          onOpen={() => {
            if (!landScreenServiceRef.current) {
              throw new Error();
            }

            replaceCurrentScreen(CurrentScreen.Dialogue);
          }}
          onClose={() => {
            if (!landScreenServiceRef.current) {
              throw new Error();
            }

            replaceCurrentScreen(CurrentScreen.Land);
          }}
          landScreenServiceRef={landScreenServiceRef}
        />
      </div>
      <div
        style={{
          display: currentScreen === CurrentScreen.App ? undefined : 'none',
          paddingBottom: '4px',
        }}
      >
        <AppScreen
          keypad={props.keypad}
          onService={replaceAppService}
          onOpen={() => {
            if (!landScreenServiceRef.current) {
              throw new Error();
            }

            replaceCurrentScreen(CurrentScreen.App);
          }}
          onClose={() => {
            if (!landScreenServiceRef.current) {
              throw new Error();
            }

            replaceCurrentScreen(CurrentScreen.Land);
          }}
          landScreenServiceRef={landScreenServiceRef}
          musicService={props.musicService}
        />
      </div>
    </>
  );
}
