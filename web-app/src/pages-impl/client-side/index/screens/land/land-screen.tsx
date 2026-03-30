import { useEffect, useState } from 'react';
import { MainApiSessionData } from 'src/main-api/session/main-api-session-types';
import { runLandGame } from './land-game';
import { globalHistory } from '@reach/router';
import { MusicService } from '../../music-ticker';
import { DialogueService } from '../dialogue/dialogue-screen';
import { LandScreenService } from './land-screen.service';
import { AppService } from '../app/app-screen';
import { ResumeLandNavigationDTO } from '@shared/land/in-game/resume/resume-land-navigation.dto';
import { useLandsAPI } from 'src/main-api/routes/lands/lands-api';
import { useTrainAPI } from 'src/main-api/routes/train/train.api';
import { navigate } from 'gatsby';
import { USER_ROUTE } from 'src/pages-impl/client-side/user/user-routes';
import { Gamepad } from '../../gamepad';
import { throwError } from 'src/throw-error';

export function LandScreen(props: {
  gamepad: Gamepad,
  musicService: MusicService;
  dialogueService: DialogueService;
  appService: AppService;
  resumedLand: ResumeLandNavigationDTO;
  session: null | MainApiSessionData;
  changeLandNameDisplay: (landName: string) => void;
  onService: (landScreenService: LandScreenService) => void;
}) {
  const [, replaceService] = useState<LandScreenService | undefined>();

  const landsApi = useLandsAPI();
  const trainApi = useTrainAPI();

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
          gamepad: props.gamepad,
          landsAPI: landsApi,
          musicService: props.musicService,
          dialogueService: props.dialogueService,
          appService: props.appService,
          changeLandNameDisplay: props.changeLandNameDisplay,
          landScreenService: sv,
          trainAPI: trainApi,
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


    const onPressing_Escape = () => {
      (async () => {
        await navigate(USER_ROUTE.getHref({ section: 'escape' }));
      })();

      return 'stop-propagation' as const;
    };

    props.gamepad.onPressing_Escape(onPressing_Escape, 'landScreen');

    return () => {
      props.gamepad.removePressing_Escape_Callback('landScreen');
    };
  }, []);

  return (
    <>
      <div id="game-root"></div>
    </>
  );
}
