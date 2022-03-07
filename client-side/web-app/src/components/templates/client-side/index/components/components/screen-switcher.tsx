import { GetLandDTO } from '@app/shared/land/get/get-land.dto';
import { useState } from 'react';
import { MainApiSessionData } from 'src/logic/app-internals/apis/main/session/main-api-session-types';
import { MusicService } from './music-ticker';
import { LandScreen, LandScreenService } from './screens/land/land-screen';

export function ScreenSwitcher(props: {
  musicService: MusicService;
  land: GetLandDTO;
  session: null | MainApiSessionData;
  changeLandNameDisplay: (landName: string) => void;
}) {
  const [, replaceLandScreenService] = useState<LandScreenService | undefined>(
    undefined,
  );

  return (
    <>
      <LandScreen {...props} onService={replaceLandScreenService} />
    </>
  );
}
