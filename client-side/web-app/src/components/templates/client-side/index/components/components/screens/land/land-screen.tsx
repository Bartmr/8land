import { useEffect, useState } from 'react';
import { MainApiSessionData } from 'src/logic/app-internals/apis/main/session/main-api-session-types';
import { runLandGame } from './land-game';
import { globalHistory } from '@reach/router';
import { MusicService } from '../../music-ticker';
import { DialogueService } from '../dialogue/dialogue-screen';
import { LandScreenService } from './land-screen.service';
import { throwError } from '@app/shared/internals/utils/throw-error';
import { AppService } from '../app/app-screen';
import { ResumeLandNavigationDTO } from '@app/shared/land/in-game/resume/resume-land-navigation.dto';
import { useLandsAPI } from 'src/logic/lands/lands-api';

export function LandScreen(props: {
  musicService: MusicService;
  dialogueService: DialogueService;
  appService: AppService;
  resumedLand: ResumeLandNavigationDTO;
  session: null | MainApiSessionData;
  changeLandNameDisplay: (landName: string) => void;
  onService: (landScreenService: LandScreenService) => void;
}) {
  const [, replaceService] = useState<LandScreenService | undefined>();

  const api = useLandsAPI();

  const [started, replaceStarted] = useState(false);

  useEffect(() => {
    (async () => {
      if (started) return;
      replaceStarted(true);

      const sv = new LandScreenService();

      // https://soundcloud.com/radion-alexievich-drozdov/spacedandywave?in=eliud-makaveli-zavala/sets/vaporwave
      await runLandGame(
        { resumedLand: props.resumedLand, session: props.session },
        {
          landsAPI: api,
          musicService: props.musicService,
          dialogueService: props.dialogueService,
          appService: props.appService,
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
