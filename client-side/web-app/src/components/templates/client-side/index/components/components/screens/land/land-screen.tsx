import { GetLandDTO } from '@app/shared/land/get/get-land.dto';
import { useEffect, useState } from 'react';
import { MainApiSessionData } from 'src/logic/app-internals/apis/main/session/main-api-session-types';
import { useMainJSONApi } from 'src/logic/app-internals/apis/main/use-main-json-api';
import { runLandGame } from './land-game';
import { globalHistory } from '@reach/router';
import { MusicService } from '../../music-ticker';
import { DialogueService } from '../dialogue/dialogue-screen';
import { LandScreenService } from './land-screen.service';
import { throwError } from '@app/shared/internals/utils/throw-error';

export function LandScreen(props: {
  musicService: MusicService;
  dialogueService: DialogueService;
  land: GetLandDTO;
  session: null | MainApiSessionData;
  changeLandNameDisplay: (landName: string) => void;
  onService: (landScreenService: LandScreenService) => void;
}) {
  const [, replaceService] = useState<LandScreenService | undefined>();

  const api = useMainJSONApi();

  const [started, replaceStarted] = useState(false);

  useEffect(() => {
    (async () => {
      if (started) return;
      replaceStarted(true);

      const sv = new LandScreenService();

      // https://soundcloud.com/radion-alexievich-drozdov/spacedandywave?in=eliud-makaveli-zavala/sets/vaporwave
      await runLandGame(
        { land: props.land, session: props.session },
        {
          api,
          musicService: props.musicService,
          dialogueService: props.dialogueService,
          changeLandNameDisplay: props.changeLandNameDisplay,
          landScreenService: sv,
        },
      );

      const listener = globalHistory.listen(() => {
        // TODO fix bug where everything freezes when pressing back button
        (sv.game || throwError()).destroy(true);

        listener();
      });

      replaceService(sv);
      props.onService(sv);
    })();
  }, []);

  return (
    <>
      <div id="game-root"></div>
    </>
  );
}
