import React from 'react';
import { useEffect, useState } from 'react';
import { UserAuthSessionData } from '../../../../../users/authentication/user-auth-types';
import { runLandGame } from './land-game';
import { globalHistory } from '@reach/router';
import { MusicService } from '../../music-ticker';
import { DialogueService } from '../dialogue/dialogue-screen';
import { LandScreenService } from './land-screen.service';
import { AppService } from '../app/app-screen';
import { ResumeLandNavigationDTO } from '../../../../../main-api/routes/lands/lands-api';
import { useLandsAPI } from '../../../../../main-api/routes/lands/lands-api';
import { useTrainAPI } from '../../../../../main-api/routes/train/train.api';
import { navigate } from 'gatsby';
import { USER_ROUTE } from '../../../user/user-routes';
import { KeypadBroker } from '../../keypad-broker';
import { throwError } from '../../../../../throw-error';

export function LandScreen(props: {
  keypad: KeypadBroker,
  musicService: MusicService;
  dialogueService: DialogueService;
  appService: AppService;
  resumedLand: ResumeLandNavigationDTO;
  session: null | UserAuthSessionData;
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
          keypadBroker: props.keypad,
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


    const onPressing_Back = () => {
      (async () => {
        await navigate(USER_ROUTE.getHref({ section: 'escape' }));
      })();

      return 'stop-propagation' as const;
    };

    props.keypad.onPressing_Back(onPressing_Back, 'landScreen');

    return () => {
      props.keypad.removePressing_Back_Callback('landScreen');
    };
  }, []);

  return (
    <>
      <div id="game-root"></div>
    </>
  );
}
