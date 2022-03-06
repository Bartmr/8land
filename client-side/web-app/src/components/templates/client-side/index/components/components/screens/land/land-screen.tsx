import { GetLandDTO } from '@app/shared/land/get/get-land.dto';
import { useEffect, useState } from 'react';
import { MainApiSessionData } from 'src/logic/app-internals/apis/main/session/main-api-session-types';
import { useMainJSONApi } from 'src/logic/app-internals/apis/main/use-main-json-api';
import { runLandGame } from './land-game';
import { globalHistory } from '@reach/router';

export function LandScreen(props: {
  onMusicChange: (musicUrl: string | null) => void;
  land: GetLandDTO;
  session: null | MainApiSessionData;
  changeLandNameDisplay: (landName: string) => void;
}) {
  const api = useMainJSONApi();

  const [started, replaceStarted] = useState(false);

  useEffect(() => {
    (async () => {
      if (started) return;
      replaceStarted(true);

      // https://soundcloud.com/radion-alexievich-drozdov/spacedandywave?in=eliud-makaveli-zavala/sets/vaporwave
      const game = await runLandGame(
        { land: props.land, session: props.session },
        {
          api,
          musicProvider: {
            changeMusic: (url: string | null) => {
              props.onMusicChange(url);
            },
          },
          changeLandNameDisplay: props.changeLandNameDisplay,
        },
      );

      const listener = globalHistory.listen(() => {
        // TODO fix bug where everything freezes when pressing back button
        game.destroy(true);

        listener();
      });
    })();
  }, []);

  return (
    <>
      <div id="game-root"></div>
    </>
  );
}
