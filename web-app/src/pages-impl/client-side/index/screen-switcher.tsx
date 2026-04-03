import { ResumeLandNavigationDTO } from 'src/main-api/routes/lands/lands.dtos';
import { useRef, useState } from 'react';
import { UserAuthSessionData } from 'src/users/auth/user-auth-types';
import { MusicService } from './music-ticker';
import { AppScreen, AppService } from './screens/app/app-screen';
import {
  DialogueScreen,
  DialogueService,
} from './screens/dialogue/dialogue-screen';
import { LandScreen } from './screens/land/land-screen';
import { LandScreenService } from './screens/land/land-screen.service';
import { Gamepad } from './gamepad';

enum CurrentScreen {
  Land = 'land',
  Dialogue = 'dialogue',
  App = 'app',
}

export function ScreenSwitcher(props: {
  gamepad: Gamepad,
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
          gamepad={props.gamepad}
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
          gamepad={props.gamepad}
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
