import { ResumeLandNavigationDTO } from '@app/shared/land/in-game/resume/resume-land-navigation.dto';
import { useRef, useState } from 'react';
import { MainApiSessionData } from 'src/logic/app-internals/apis/main/session/main-api-session-types';
import { MusicService } from './music-ticker';
import { AppScreen, AppService } from './screens/app/app-screen';
import {
  DialogueScreen,
  DialogueService,
} from './screens/dialogue/dialogue-screen';
import { LandScreen } from './screens/land/land-screen';
import { LandScreenService } from './screens/land/land-screen.service';

enum CurrentScreen {
  Land = 'land',
  Dialogue = 'dialogue',
  App = 'app',
}

export function ScreenSwitcher(props: {
  musicService: MusicService;
  resumedLand: ResumeLandNavigationDTO;
  session: null | MainApiSessionData;
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
