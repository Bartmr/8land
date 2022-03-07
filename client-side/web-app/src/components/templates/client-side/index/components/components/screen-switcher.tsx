import { GetLandDTO } from '@app/shared/land/get/get-land.dto';
import { useRef, useState } from 'react';
import { MainApiSessionData } from 'src/logic/app-internals/apis/main/session/main-api-session-types';
import { MusicService } from './music-ticker';
import {
  DialogueScreen,
  DialogueService,
} from './screens/dialogue/dialogue-screen';
import { LandScreen, LandScreenService } from './screens/land/land-screen';

enum CurrentScreen {
  Land = 'land',
  Dialogue = 'dialogue',
}

export function ScreenSwitcher(props: {
  musicService: MusicService;
  land: GetLandDTO;
  session: null | MainApiSessionData;
  changeLandNameDisplay: (landName: string) => void;
}) {
  const landScreenServiceRef = useRef<null | LandScreenService>(null);

  const [dialogueService, replaceDialogueService] = useState<
    DialogueService | undefined
  >();

  const [currentScreen, replaceCurrentScreen] = useState(CurrentScreen.Land);

  return (
    <>
      {dialogueService ? (
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
        />
      </div>
    </>
  );
}
